import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { PrismaService } from '../../prisma/prisma.service';
import { AppEventsGateway } from '../app-events/app-events.gateway';
import { firstValueFrom } from 'rxjs';

const GRAPH_BASE = 'https://graph.facebook.com/v21.0';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private prisma: PrismaService,
    private http: HttpService,
    private config: ConfigService,
    private events: AppEventsGateway,
  ) {}

  // ─── Embedded Signup ────────────────────────────────────────────────────────

  async connectFromEmbeddedSignup(
    workspaceId: string,
    code: string,
  ): Promise<{ phoneNumber: string; displayName: string }> {
    const appId =
      this.config.get<string>('META_APP_ID') ??
      this.config.get<string>('FACEBOOK_APP_ID');
    const appSecret =
      this.config.get<string>('META_APP_SECRET') ??
      this.config.get<string>('FACEBOOK_APP_SECRET');

    // Exchange short-lived code for system user access token
    const tokenRes = await firstValueFrom(
      this.http.get<{ access_token: string; token_type: string }>(
        `${GRAPH_BASE}/oauth/access_token`,
        {
          params: {
            client_id: appId,
            client_secret: appSecret,
            code,
          },
        },
      ),
    );

    const userToken = tokenRes.data.access_token;

    // Fetch WABA details from the token's linked business
    const wabaRes = await firstValueFrom(
      this.http.get<{ data: Array<{ id: string; name: string }> }>(
        `${GRAPH_BASE}/me/businesses`,
        { params: { access_token: userToken, fields: 'id,name' } },
      ),
    );

    const business = wabaRes.data.data[0];
    if (!business)
      throw new BadRequestException('No Meta Business found for this account');

    // Get WABAs under this business
    const wabaListRes = await firstValueFrom(
      this.http.get<{ data: Array<{ id: string; name: string }> }>(
        `${GRAPH_BASE}/${business.id}/owned_whatsapp_business_accounts`,
        { params: { access_token: userToken } },
      ),
    );

    const waba = wabaListRes.data.data[0];
    if (!waba)
      throw new BadRequestException('No WhatsApp Business Account found');

    // Get phone numbers under this WABA
    const phoneRes = await firstValueFrom(
      this.http.get<{
        data: Array<{
          id: string;
          display_phone_number: string;
          verified_name: string;
        }>;
      }>(`${GRAPH_BASE}/${waba.id}/phone_numbers`, {
        params: { access_token: userToken },
      }),
    );

    const phone = phoneRes.data.data[0];
    if (!phone)
      throw new BadRequestException('No phone number found for this WABA');

    await this.prisma.whatsAppConnection.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        wabaId: waba.id,
        phoneNumberId: phone.id,
        phoneNumber: phone.display_phone_number,
        displayName: phone.verified_name,
        accessToken: userToken,
      },
      update: {
        wabaId: waba.id,
        phoneNumberId: phone.id,
        phoneNumber: phone.display_phone_number,
        displayName: phone.verified_name,
        accessToken: userToken,
      },
    });

    return {
      phoneNumber: phone.display_phone_number,
      displayName: phone.verified_name,
    };
  }

  async disconnect(workspaceId: string): Promise<void> {
    await this.prisma.whatsAppConnection.deleteMany({ where: { workspaceId } });
  }

  async getStatus(workspaceId: string) {
    const conn = await this.prisma.whatsAppConnection.findUnique({
      where: { workspaceId },
    });
    if (!conn) return { connected: false };
    return {
      connected: true,
      phoneNumber: conn.phoneNumber,
      displayName: conn.displayName,
    };
  }

  private async getConnection(workspaceId: string) {
    const conn = await this.prisma.whatsAppConnection.findUnique({
      where: { workspaceId },
    });
    if (!conn)
      throw new NotFoundException('WhatsApp not connected for this workspace');
    return conn;
  }

  // ─── Webhook verification ────────────────────────────────────────────────────

  verifyWebhook(mode: string, token: string, challenge: string): string {
    const expected = this.config.get<string>('META_WEBHOOK_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === expected) return challenge;
    throw new UnauthorizedException('Webhook verification failed');
  }

  // ─── Inbound webhook processing ─────────────────────────────────────────────

  async handleWebhookEvent(body: any): Promise<void> {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0]?.value;
    if (!changes) return;

    const wabaId: string = changes.metadata?.phone_number_id;
    const messages: any[] = changes.messages ?? [];
    const contacts: any[] = changes.contacts ?? [];

    const conn = await this.prisma.whatsAppConnection.findFirst({
      where: { phoneNumberId: wabaId },
    });
    if (!conn) {
      this.logger.warn(`No workspace found for phone_number_id=${wabaId}`);
      return;
    }

    for (const msg of messages) {
      const senderId: string = msg.from;
      const contact = contacts.find((c: any) => c.wa_id === senderId);
      const senderName: string = contact?.profile?.name ?? senderId;

      let conversation = await this.prisma.inboxConversation.findUnique({
        where: {
          workspaceId_platform_externalId: {
            workspaceId: conn.workspaceId,
            platform: 'WHATSAPP',
            externalId: senderId,
          },
        },
      });

      if (!conversation) {
        conversation = await this.prisma.inboxConversation.create({
          data: {
            workspaceId: conn.workspaceId,
            platform: 'WHATSAPP',
            externalId: senderId,
            participantName: senderName,
            participantId: senderId,
          },
        });
      } else {
        await this.prisma.inboxConversation.update({
          where: { id: conversation.id },
          data: {
            participantName: senderName,
            lastMessageAt: new Date(),
            unreadCount: { increment: 1 },
          },
        });
      }

      const content =
        msg.text?.body ??
        msg.image?.caption ??
        msg.document?.caption ??
        '[media]';
      const mediaUrl =
        msg.image?.link ?? msg.document?.link ?? msg.video?.link ?? null;
      const mediaType = msg.image
        ? 'image'
        : msg.document
          ? 'document'
          : msg.video
            ? 'video'
            : null;

      await this.prisma.inboxMessage.upsert({
        where: { externalId: msg.id },
        create: {
          conversationId: conversation.id,
          externalId: msg.id,
          direction: 'INBOUND',
          content,
          mediaUrl,
          mediaType,
          sentAt: new Date(parseInt(msg.timestamp) * 1000),
        },
        update: {},
      });

      // Real-time notification
      this.events.sendToWorkspace(conn.workspaceId, 'inbox:message', {
        platform: 'WHATSAPP',
        conversationId: conversation.id,
        message: { content, direction: 'INBOUND', sentAt: new Date() },
        participantName: senderName,
      });
    }
  }

  // ─── Send message ────────────────────────────────────────────────────────────

  async sendMessage(workspaceId: string, conversationId: string, text: string) {
    const conn = await this.getConnection(workspaceId);

    const conversation = await this.prisma.inboxConversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.platform !== 'WHATSAPP') {
      throw new BadRequestException(
        'This conversation is not a WhatsApp thread',
      );
    }

    await firstValueFrom(
      this.http.post(
        `${GRAPH_BASE}/${conn.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          to: conversation.externalId,
          type: 'text',
          text: { body: text },
        },
        { headers: { Authorization: `Bearer ${conn.accessToken}` } },
      ),
    );

    const msg = await this.prisma.inboxMessage.create({
      data: {
        conversationId,
        direction: 'OUTBOUND',
        content: text,
        sentAt: new Date(),
      },
    });

    await this.prisma.inboxConversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return msg;
  }

  // ─── Unified inbox ───────────────────────────────────────────────────────────

  async getInbox(workspaceId: string) {
    const conversations = await this.prisma.inboxConversation.findMany({
      where: { workspaceId },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          orderBy: { sentAt: 'desc' },
          take: 1,
        },
      },
    });

    return conversations.map((c) => ({
      id: c.id,
      platform: c.platform,
      participantName: c.participantName,
      participantId: c.participantId,
      participantAvatar: c.participantAvatar,
      lastMessage: c.messages[0] ?? null,
      lastMessageAt: c.lastMessageAt,
      unreadCount: c.unreadCount,
      status: c.status,
    }));
  }

  async getConversation(workspaceId: string, conversationId: string) {
    const conversation = await this.prisma.inboxConversation.findFirst({
      where: { id: conversationId, workspaceId },
      include: {
        messages: { orderBy: { sentAt: 'asc' } },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');

    // Mark as read
    await this.prisma.inboxConversation.update({
      where: { id: conversationId },
      data: { unreadCount: 0 },
    });

    return conversation;
  }

  async markRead(workspaceId: string, conversationId: string) {
    await this.prisma.inboxConversation.updateMany({
      where: { id: conversationId, workspaceId },
      data: { unreadCount: 0 },
    });
    return { ok: true };
  }
}
