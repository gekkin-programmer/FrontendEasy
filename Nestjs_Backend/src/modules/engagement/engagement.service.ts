import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FacebookService } from '../social-accounts/platforms/facebook.service';

@Injectable()
export class EngagementService {
  constructor(
    private prisma: PrismaService,
    private facebookService: FacebookService,
  ) {}

  // 1. GET UNIFIED INBOX
  async findAll(workspaceId: string) {
    const [comments, inboxConversations] = await Promise.all([
      this.prisma.postComment.findMany({
        where: {
          post: { workspaceId },
          isReply: false,
        },
        include: { post: true },
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.inboxConversation.findMany({
        where: { workspaceId },
        orderBy: { lastMessageAt: 'desc' },
        include: {
          messages: {
            orderBy: { sentAt: 'desc' },
            take: 1,
          },
        },
      }),
    ]);

    const commentItems = comments.map((c) => ({
      _id: c.id,
      type: 'comment' as const,
      authorName: c.authorName,
      authorHandle: 'Facebook User',
      authorAvatar: null,
      platform: (c.platform?.toLowerCase() ?? 'facebook') as string,
      content: c.content,
      receivedAt: c.publishedAt,
      status: c.status,
      sentiment: c.sentiment || 'neutral',
      externalId: c.externalId,
      postId: c.postId,
    }));

    const inboxItems = inboxConversations.map((conv) => ({
      _id: conv.id,
      type: 'dm' as const,
      authorName: conv.participantName ?? conv.participantId ?? 'Unknown',
      authorHandle: conv.participantId ?? null,
      authorAvatar: conv.participantAvatar ?? null,
      platform: conv.platform.toLowerCase().replace('_dm', ''),
      content: conv.messages[0]?.content ?? '',
      receivedAt: conv.lastMessageAt,
      status: conv.status,
      sentiment: 'neutral' as const,
      externalId: conv.externalId,
      postId: null,
      unreadCount: conv.unreadCount,
      conversationId: conv.id,
    }));

    return [...inboxItems, ...commentItems].sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime(),
    );
  }

  // 2. REPLY (handles both comments and DM conversations)
  async reply(id: string, text: string, workspaceId: string) {
    // Check if it's a DM conversation first
    const conv = await this.prisma.inboxConversation.findFirst({
      where: { id, workspaceId },
    });

    if (conv) {
      // DM replies route through the dedicated WhatsApp endpoint — return a redirect hint
      return { success: false, redirect: `/whatsapp/inbox/${conv.id}/send` };
    }

    // Fall back to comment reply
    const comment = await this.prisma.postComment.findUnique({
      where: { id },
      include: { post: { include: { socialAccount: true } } },
    });

    if (!comment) throw new NotFoundException('Comment not found');

    const account = comment.post.socialAccount;
    if (!account) throw new NotFoundException('Linked account not found');

    if (comment.platform === 'FACEBOOK' && comment.externalId) {
      await this.facebookService.replyToComment(
        account.accessToken,
        comment.externalId,
        text,
      );
    }

    await this.prisma.postComment.create({
      data: {
        content: text,
        postId: comment.postId,
        externalId: `reply_${Date.now()}`,
        authorName: 'Me',
        platform: comment.platform,
        publishedAt: new Date(),
        isReply: true,
        parentId: comment.id,
        status: 'replied',
      },
    });

    await this.prisma.postComment.update({
      where: { id },
      data: { status: 'replied' },
    });

    return { success: true };
  }

  // 3. STATUS UPDATE
  async updateStatus(id: string, status: string) {
    const conv = await this.prisma.inboxConversation.findUnique({ where: { id } });
    if (conv) {
      return this.prisma.inboxConversation.update({ where: { id }, data: { status } });
    }
    return this.prisma.postComment.update({ where: { id }, data: { status } });
  }
}
