import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FacebookService } from '../social-accounts/platforms/facebook.service';

@Injectable()
export class EngagementService {
  constructor(
    private prisma: PrismaService,
    private facebookService: FacebookService,
  ) {}

  // 1. GET INBOX
  async findAll(workspaceId: string) {
    const comments = await this.prisma.postComment.findMany({
      where: {
        post: { workspaceId },
        isReply: false, // Don't show our own replies in inbox
      },
      include: { post: true },
      orderBy: { publishedAt: 'desc' },
    });

    return comments.map((c) => ({
      _id: c.id,
      authorName: c.authorName,
      authorHandle: 'Facebook User', // FB doesn't give handles in basic API
      authorAvatar: null, // Frontend will show initial
      platform: 'facebook',
      content: c.content,
      receivedAt: c.publishedAt,
      status: c.status,
      sentiment: c.sentiment || 'neutral',
      externalId: c.externalId,
      postId: c.postId,
    }));
  }

  // 2. REPLY
  async reply(commentId: string, text: string, _workspaceId: string) {
    // A. Find the comment
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
      include: { post: { include: { socialAccount: true } } }, // Need token
    });

    if (!comment) throw new NotFoundException('Comment not found');

    const account = comment.post.socialAccount;
    if (!account) throw new NotFoundException('Linked account not found');

    // B. Send to Platform
    if (comment.platform === 'FACEBOOK' && comment.externalId) {
      await this.facebookService.replyToComment(
        account.accessToken,
        comment.externalId,
        text,
      );
    }

    // C. Save our reply to DB (so it shows as threaded later)
    await this.prisma.postComment.create({
      data: {
        content: text,
        postId: comment.postId,
        externalId: `reply_${Date.now()}`, // Placeholder until we sync again
        authorName: 'Me',
        platform: comment.platform,
        publishedAt: new Date(),
        isReply: true,
        parentId: comment.id,
        status: 'replied',
      },
    });

    // D. Update original status
    await this.prisma.postComment.update({
      where: { id: commentId },
      data: { status: 'replied' },
    });

    return { success: true };
  }

  // 3. STATUS UPDATE
  async updateStatus(id: string, status: string) {
    return this.prisma.postComment.update({
      where: { id },
      data: { status },
    });
  }
}
