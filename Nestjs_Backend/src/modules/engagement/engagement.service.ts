import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FacebookService } from '../social-accounts/platforms/facebook.service';
import { InstagramService } from '../social-accounts/platforms/instagram.service';
import { TwitterService } from '../social-accounts/platforms/twitter.service';
import { SocialPlatform } from '@prisma/client';

@Injectable()
export class EngagementService {
  private readonly logger = new Logger(EngagementService.name);

  constructor(
    private prisma: PrismaService,
    private facebookService: FacebookService,
    private instagramService: InstagramService,
    private twitterService: TwitterService,
  ) {}

  // 1. GET INBOX
  async findAll(workspaceId: string) {
    const comments = await this.prisma.postComment.findMany({
      where: { 
        post: { workspaceId },
        isReply: false 
      },
      include: { post: true },
      orderBy: { publishedAt: 'desc' }
    });

    return comments.map(c => ({
      _id: c.id,
      authorName: c.authorName || 'User',
      authorHandle: c.platform === 'TWITTER' ? `@${c.authorName}` : c.authorName,
      authorAvatar: c.authorAvatar,
      platform: c.platform?.toLowerCase() || 'facebook',
      content: c.content,
      receivedAt: c.publishedAt,
      status: c.status,
      sentiment: c.sentiment || 'neutral',
      externalId: c.externalId,
      postId: c.postId
    }));
  }

  // 2. REPLY
  async reply(commentId: string, text: string, workspaceId: string) {
    // A. Find the comment
    const comment = await this.prisma.postComment.findUnique({
      where: { id: commentId },
      include: { post: { include: { socialAccount: true } } } 
    });

    if (!comment) throw new NotFoundException('Comment not found');

    const account = comment.post.socialAccount;
    if (!account) throw new NotFoundException('Linked account not found');

    // B. Send to Platform
    let platformReplyId: string | null = null;
    
    try {
        if (comment.platform === SocialPlatform.FACEBOOK && comment.externalId) {
           platformReplyId = await this.facebookService.replyToComment(
             account.accessToken, 
             comment.externalId, 
             text
           );
        } else if (comment.platform === SocialPlatform.INSTAGRAM && comment.externalId) {
            platformReplyId = await this.instagramService.replyToComment(
                account.accessToken,
                comment.externalId,
                text
            );
        } else if (comment.platform === SocialPlatform.TWITTER && comment.externalId) {
            platformReplyId = await this.twitterService.replyToComment(
                account.accessToken,
                comment.externalId,
                text
            );
        }
    } catch (e) {
        this.logger.error(`Platform Reply Failed: ${e.message}`);
        // For development, we allow it to save to DB even if API call fails (mocking behavior)
    }

    // C. Save our reply to DB
    await this.prisma.postComment.create({
        data: {
            content: text,
            postId: comment.postId,
            externalId: platformReplyId || `reply_${Date.now()}`, 
            authorName: 'Me',
            platform: comment.platform,
            publishedAt: new Date(),
            isReply: true,
            parentId: comment.id,
            status: 'replied'
        }
    });

    // D. Update original status
    await this.prisma.postComment.update({
        where: { id: commentId },
        data: { status: 'replied' }
    });

    return { success: true };
  }

  // 3. SYNC INBOX (Fetch from Platforms)
  async sync(workspaceId: string) {
    const accounts = await this.prisma.socialAccount.findMany({
        where: { workspaceId, isActive: true }
    });

    for (const acc of accounts) {
        try {
            let externalPosts: any[] = [];
            if (acc.platform === SocialPlatform.INSTAGRAM && acc.platformUserId) {
                externalPosts = await this.instagramService.getHistory(acc.accessToken, acc.platformUserId);
            } else if (acc.platform === SocialPlatform.FACEBOOK && acc.platformUserId) {
                externalPosts = await this.facebookService.getHistory(acc.accessToken, acc.platformUserId);
            } else if (acc.platform === SocialPlatform.TWITTER && acc.platformUserId) {
                externalPosts = await this.twitterService.getHistory(acc.accessToken, acc.platformUserId);
            }

            for (const ep of externalPosts) {
                if (ep.comments && ep.comments.length > 0) {
                    for (const ec of ep.comments) {
                        // Upsert comment
                        await this.prisma.postComment.upsert({
                            where: { externalId: ec.externalId },
                            update: {
                                content: ec.content,
                                status: 'unread'
                            },
                            create: {
                                externalId: ec.externalId,
                                content: ec.content,
                                authorName: ec.authorName,
                                platform: acc.platform,
                                publishedAt: ec.publishedAt || new Date(),
                                // Try to link to a post in our DB if we find externalId match
                                post: {
                                    connect: { id: await this.findPostIdByExternalId(ep.externalId) }
                                }
                            }
                        });
                    }
                }
            }
        } catch (e) {
            this.logger.warn(`Failed to sync ${acc.platform} for ${workspaceId}: ${e.message}`);
        }
    }

    return { message: 'Sync triggered' };
  }

  private async findPostIdByExternalId(externalId: string): Promise<string | undefined> {
      const psa = await this.prisma.postSocialAccount.findFirst({
          where: { platformPostId: externalId },
          select: { postId: true }
      });
      return psa?.postId;
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.postComment.update({
        where: { id },
        data: { status }
    });
  }
}
