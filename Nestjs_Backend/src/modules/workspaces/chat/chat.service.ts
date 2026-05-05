import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateChannelDto, CreateMessageDto } from './dto/create-message.dto';
import { ChatMessageType } from '@prisma/client';
import { AppEventsGateway } from '../../app-events/app-events.gateway';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private appEventsGateway: AppEventsGateway,
  ) {}

  // ➤ 1. Create a Channel
  async createChannel(
    workspaceId: string,
    userId: string,
    dto: CreateChannelDto,
  ) {
    await this.verifyMembership(workspaceId, userId);

    const name = dto.name.toLowerCase().replace(/\s/g, '-');

    const existing = await this.prisma.chatChannel.findUnique({
      where: { workspaceId_name: { workspaceId, name } },
    });
    if (existing) return existing;

    return this.prisma.chatChannel.create({
      data: { workspaceId, name, description: dto.description },
    });
  }

  // ➤ 2. List Channels
  async getChannels(workspaceId: string, userId: string) {
    await this.verifyMembership(workspaceId, userId);
    return this.prisma.chatChannel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ➤ 3. Send Message
  async sendMessage(channelId: string, userId: string, dto: CreateMessageDto) {
    const channel = await this.prisma.chatChannel.findUnique({
      where: { id: channelId },
    });
    if (!channel) throw new NotFoundException('Channel not found');

    await this.verifyMembership(channel.workspaceId, userId);

    const message = await this.prisma.chatMessage.create({
      data: {
        channelId,
        senderId: userId,
        content: dto.content || '',
        type: (dto.type as ChatMessageType) || ChatMessageType.TEXT,
        attachmentUrl: dto.attachmentUrl,
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatar: true, email: true },
        },
      },
    });

    // Broadcast to all workspace members in real-time
    this.appEventsGateway.sendToWorkspace(channel.workspaceId, 'chat_message', {
      ...message,
      channelId,
    });

    return message;
  }

  // ➤ 4. Get Message History
  async getMessages(channelId: string, userId: string) {
    const channel = await this.prisma.chatChannel.findUnique({
      where: { id: channelId },
    });
    if (!channel) throw new NotFoundException('Channel not found');

    await this.verifyMembership(channel.workspaceId, userId);

    return this.prisma.chatMessage.findMany({
      where: { channelId },
      take: 100,
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatar: true, email: true },
        },
      },
    });
  }

  // Helper — accepts workspace owner OR workspace member
  private async verifyMembership(workspaceId: string, userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } },
        ],
      },
    });
    if (!workspace)
      throw new ForbiddenException('You are not a member of this workspace');
  }
}
