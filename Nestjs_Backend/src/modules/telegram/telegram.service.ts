import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string };
    text?: string;
  };
}

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private readonly token: string;
  private readonly apiBase: string;
  private pollingOffset = 0;
  private pollingInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.token = this.config.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.apiBase = `https://api.telegram.org/bot${this.token}`;
  }

  async onModuleInit() {
    if (!this.token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not set — Telegram bot disabled');
      return;
    }

    const webhookUrl = this.config.get<string>('TELEGRAM_WEBHOOK_URL');
    if (webhookUrl) {
      await this.setWebhook(webhookUrl);
    } else {
      this.logger.log('No TELEGRAM_WEBHOOK_URL set — starting long-polling');
      this.startPolling();
    }
  }

  // =================================================================
  // WEBHOOK MODE (production)
  // =================================================================

  async setWebhook(url: string) {
    try {
      const res = await axios.post(`${this.apiBase}/setWebhook`, { url });
      if (res.data.ok) {
        this.logger.log(`Webhook registered: ${url}`);
      } else {
        this.logger.error('Webhook registration failed', res.data);
      }
    } catch (e) {
      this.logger.error('setWebhook error', e.message);
    }
  }

  async handleWebhookUpdate(update: TelegramUpdate) {
    if (update.message?.text) {
      await this.handleMessage(update.message);
    }
  }

  // =================================================================
  // POLLING MODE (development)
  // =================================================================

  private startPolling() {
    this.pollingInterval = setInterval(() => void this.poll(), 3000);
  }

  private async poll() {
    try {
      const res = await axios.get(`${this.apiBase}/getUpdates`, {
        params: { offset: this.pollingOffset, timeout: 1 },
      });
      const updates: TelegramUpdate[] = res.data.result || [];
      for (const update of updates) {
        this.pollingOffset = update.update_id + 1;
        if (update.message?.text) {
          await this.handleMessage(update.message);
        }
      }
    } catch {
      // Polling errors are transient; silently retry
    }
  }

  // =================================================================
  // COMMAND HANDLERS
  // =================================================================

  private async handleMessage(message: NonNullable<TelegramUpdate['message']>) {
    const { chat, text, from } = message;
    const chatId = chat.id;
    const trimmed = text?.trim() || '';

    if (trimmed.startsWith('/start')) {
      await this.sendMessage(
        chatId,
        `👋 Welcome to *EazyPost*, ${from.first_name}!\n\n` +
          `EazyPost helps African creators manage all their social media in one place.\n\n` +
          `To link your Telegram to your EazyPost account:\n` +
          `1. Go to your EazyPost dashboard → *Connect Accounts*\n` +
          `2. Click *Connect Telegram*\n` +
          `3. Copy the token shown and send it here:\n\n` +
          `\`/link YOUR_TOKEN\``,
        'Markdown',
      );
      return;
    }

    if (trimmed.startsWith('/help')) {
      await this.sendMessage(
        chatId,
        `*EazyPost Bot Commands:*\n\n` +
          `/start — Introduction & linking guide\n` +
          `/link <token> — Link this Telegram to your EazyPost account\n` +
          `/status — Check your linked account status\n` +
          `/disconnect — Unlink this Telegram account\n` +
          `/help — Show this message`,
        'Markdown',
      );
      return;
    }

    if (trimmed.startsWith('/link ')) {
      const token = trimmed.replace('/link ', '').trim();
      await this.linkAccount(chatId, from, token);
      return;
    }

    if (trimmed.startsWith('/status')) {
      await this.statusCheck(chatId, String(chat.id));
      return;
    }

    if (trimmed.startsWith('/disconnect')) {
      await this.disconnectAccount(chatId, String(chat.id));
      return;
    }

    // Default reply
    await this.sendMessage(
      chatId,
      `I didn't understand that. Type /help for available commands.`,
    );
  }

  // =================================================================
  // LINKING LOGIC
  // =================================================================

  async linkAccount(
    chatId: number,
    from: { id: number; first_name: string; username?: string },
    linkToken: string,
  ) {
    try {
      // Find the pending link token in DB
      const pending = await this.prisma.telegramLinkToken.findUnique({
        where: { token: linkToken },
        include: { user: { include: { ownedWorkspaces: true } } },
      });

      if (!pending) {
        await this.sendMessage(chatId, '❌ Invalid or expired token. Please generate a new one from your EazyPost dashboard.');
        return;
      }

      if (new Date() > pending.expiresAt) {
        await this.prisma.telegramLinkToken.delete({ where: { token: linkToken } });
        await this.sendMessage(chatId, '❌ This token has expired. Please generate a new one.');
        return;
      }

      const workspaceId = pending.workspaceId || pending.user.ownedWorkspaces[0]?.id;
      if (!workspaceId) {
        await this.sendMessage(chatId, '❌ No workspace found for your account.');
        return;
      }

      // Upsert the social account
      const platformUserId = String(from.id);
      const existing = await this.prisma.socialAccount.findUnique({
        where: {
          workspaceId_platform_platformUserId: {
            workspaceId,
            platform: 'TELEGRAM',
            platformUserId,
          },
        },
      });

      await this.prisma.socialAccount.upsert({
        where: {
          workspaceId_platform_platformUserId: {
            workspaceId,
            platform: 'TELEGRAM',
            platformUserId,
          },
        },
        update: {
          username: from.username || from.first_name,
          displayName: from.first_name,
          isActive: true,
          accessToken: String(chatId), // Store chatId as accessToken for messaging
          updatedAt: new Date(),
        },
        create: {
          workspaceId,
          createdById: pending.userId,
          platform: 'TELEGRAM',
          platformUserId,
          username: from.username || from.first_name,
          displayName: from.first_name,
          accessToken: String(chatId),
          isActive: true,
        },
      });

      if (!existing) {
        await this.prisma.workspace.update({
          where: { id: workspaceId },
          data: { currentSocialAccountCount: { increment: 1 } },
        });
      }

      // Clean up the used token
      await this.prisma.telegramLinkToken.delete({ where: { token: linkToken } });

      await this.sendMessage(
        chatId,
        `✅ *Success!* Your Telegram is now linked to EazyPost.\n\n` +
          `You'll receive post notifications and can manage your social media directly from here.`,
        'Markdown',
      );
    } catch (e) {
      this.logger.error('linkAccount error', e.message);
      await this.sendMessage(chatId, '❌ Something went wrong. Please try again.');
    }
  }

  private async statusCheck(chatId: number, telegramId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { platform: 'TELEGRAM', platformUserId: telegramId },
      include: { workspace: true },
    });

    if (!account) {
      await this.sendMessage(chatId, '❌ This Telegram is not linked to any EazyPost account.\n\nSend /link <token> to connect.');
      return;
    }

    await this.sendMessage(
      chatId,
      `✅ *Linked to:* ${account.workspace.name}\n*Status:* ${account.isActive ? 'Active' : 'Inactive'}`,
      'Markdown',
    );
  }

  private async disconnectAccount(chatId: number, telegramId: string) {
    const deleted = await this.prisma.socialAccount.findFirst({
      where: { platform: 'TELEGRAM', platformUserId: telegramId },
    });

    if (!deleted) {
      await this.sendMessage(chatId, 'No linked account found.');
      return;
    }

    await this.prisma.socialAccount.delete({ where: { id: deleted.id } });
    await this.sendMessage(chatId, '✅ Your Telegram has been disconnected from EazyPost.');
  }

  // =================================================================
  // LINK TOKEN GENERATION (called from API)
  // =================================================================

  async generateLinkToken(userId: string, workspaceId?: string): Promise<string> {
    const token = Math.random().toString(36).slice(2, 10).toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Clean up any old tokens for this user
    await this.prisma.telegramLinkToken.deleteMany({ where: { userId } });

    await this.prisma.telegramLinkToken.create({
      data: { token, userId, expiresAt, ...(workspaceId ? { workspaceId } : {}) },
    });

    return token;
  }

  // =================================================================
  // UTILITY
  // =================================================================

  private async sendMessage(chatId: number, text: string, parseMode?: string) {
    try {
      await axios.post(`${this.apiBase}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: parseMode,
      });
    } catch (e) {
      this.logger.error(`sendMessage failed for chat ${chatId}:`, e.message);
    }
  }
}
