import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateChannelDto, CreateMessageDto } from './dto/create-message.dto';
import { ChatMessageType } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  // ➤ 1. Create a Channel (e.g. #marketing)
  async createChannel(workspaceId: string, userId: string, dto: CreateChannelDto) {
    await this.verifyMembership(workspaceId, userId);
    
    return this.prisma.chatChannel.create({
      data: {
        workspaceId,
        name: dto.name.toLowerCase().replace(/\s/g, '-'), // "My Chat" -> "my-chat"
        description: dto.description
      }
    });
  }

  // ➤ 2. List Channels
  async getChannels(workspaceId: string, userId: string) {
    await this.verifyMembership(workspaceId, userId);
    return this.prisma.chatChannel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' }
    });
  }

  // ➤ 3. Send Message
  async sendMessage(channelId: string, userId: string, dto: CreateMessageDto) {
    const channel = await this.prisma.chatChannel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('Channel not found');

    await this.verifyMembership(channel.workspaceId, userId);

        return this.prisma.chatMessage.create({
      data: {
        channelId,
        senderId: userId,
        content: dto.content || '', 
        type: (dto.type as ChatMessageType) || ChatMessageType.TEXT,  
        attachmentUrl: dto.attachmentUrl
      },
      include: {
        sender: { select: { id: true, firstName: true, avatar: true } }
      }
    });
  }

  // ➤ 4. Get Message History
  async getMessages(channelId: string, userId: string) {
    const channel = await this.prisma.chatChannel.findUnique({ where: { id: channelId } });
    if (!channel) throw new NotFoundException('Channel not found');

    await this.verifyMembership(channel.workspaceId, userId);

    return this.prisma.chatMessage.findMany({
      where: { channelId },
      take: 50, // Limit to last 50 messages
      orderBy: { createdAt: 'asc' }, // Oldest first (like Slack)
      include: {
        sender: { select: { id: true, firstName: true, avatar: true } }
      }
    });
  }

  // Helper
  private async verifyMembership(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } }
    });
    if (!member) throw new ForbiddenException('You are not a member of this workspace');
  }
}
