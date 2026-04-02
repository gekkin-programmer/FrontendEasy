import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FacebookService } from '../platforms/facebook.service';
import { SocialPlatform } from '../../../common/enums/social-platform.enum';
import { PostStatus } from '../../../common/enums/post-status.enum';
import { NormalizedSocialPost } from '../interfaces/social-platform.interface';
import { SocialTokenExpiredException } from '../../../common/exceptions/token-expired.exception';
import { EmailService } from '../../../common/providers/email/email.service';

interface SyncJobData {
  socialAccountId: string;
  platform: SocialPlatform;
  accessToken: string;
  externalId: string;
}

@Processor('social-sync')
export class SocialSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SocialSyncProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly facebookService: FacebookService,
    private readonly emailService: EmailService,
  ) {
    super();
  }

  async process(job: Job<SyncJobData>): Promise<void> {
    const { socialAccountId, platform, accessToken, externalId } = job.data;
    this.logger.log(
      `[Job ${job.id}] Starting history sync for ${platform}: ${externalId}`,
    );

    try {
      const account = await this.prisma.socialAccount.findUnique({
        where: { id: socialAccountId },
        select: { workspaceId: true, createdById: true },
      });

      if (!account) {
        throw new Error(`SocialAccount ${socialAccountId} not found`);
      }

      let posts: NormalizedSocialPost[] = [];

      switch (platform) {
        case SocialPlatform.FACEBOOK:
          posts = await this.facebookService.getHistory(
            accessToken,
            externalId,
          );
          break;
        default:
          this.logger.warn(`Platform ${platform} sync not implemented yet.`);
          return;
      }

      this.logger.log(
        `Fetched ${posts.length} posts. Syncing with Database...`,
      );

      // ➤ LOGIC CHANGE: We cannot use Post.upsert because 'externalId' is now in a different table.
      // We iterate and check PostSocialAccount instead.

      for (const post of posts) {
        // 1. Check if this specific Facebook post is already linked in our DB
        const existingLink = await this.prisma.postSocialAccount.findFirst({
          where: {
            socialAccountId: socialAccountId,
            platformPostId: post.externalId,
          },
        });

        if (existingLink) {
          // A. UPDATE: Post exists, just update metrics on the relation
          await this.prisma.postSocialAccount.update({
            where: { id: existingLink.id },
            data: {
              likes: post.engagement.likes,
              comments: post.engagement.comments,
              shares: post.engagement.shares,
              views: post.engagement.views,
              // Update URL if changed
              platformPostUrl: post.permalink,
            },
          });
        } else {
          // B. CREATE: New Post + New Relation
          await this.prisma.post.create({
            data: {
              workspaceId: account.workspaceId,
              createdById: account.createdById,
              content: post.content || '', // Handle empty content (image only posts)
              mediaUrls: post.mediaUrls, // Legacy support or migrate to MediaLibrary later
              status: PostStatus.PUBLISHED,
              publishedAt: new Date(post.publishedAt),

              // Optional: link directly to account for simplified queries
              socialAccountId: socialAccountId,

              // Create the relation to store Platform ID and Metrics
              socialAccounts: {
                create: {
                  socialAccountId: socialAccountId,
                  platformPostId: post.externalId,
                  platformPostUrl: post.permalink,
                  status: PostStatus.PUBLISHED,
                  publishedAt: new Date(post.publishedAt),
                  likes: post.engagement.likes,
                  comments: post.engagement.comments,
                  shares: post.engagement.shares,
                  views: post.engagement.views,
                },
              },
            },
          });
        }
      }

      await this.prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: { lastSyncedAt: new Date() },
      });

      this.logger.log(`[Job ${job.id}] Sync complete.`);
    } catch (error) {
      // ➤ HANDLE TOKEN EXPIRY
      if (error instanceof SocialTokenExpiredException) {
        this.logger.warn(
          `Token expired for ${socialAccountId}. Disabling and notifying user.`,
        );

        await this.prisma.socialAccount.update({
          where: { id: socialAccountId },
          data: { isActive: false },
        });

        const account = await this.prisma.socialAccount.findUnique({
          where: { id: socialAccountId },
          include: { createdBy: true },
        });

        if (account?.createdBy?.email) {
          await this.emailService.sendTokenExpiryAlert(
            account.createdBy.email,
            account.createdBy.firstName || 'User',
            platform,
          );
        }
        return;
      }

      this.logger.error(`[Job ${job.id}] Sync failed: ${error.message}`);
      throw error;
    }
  }
}
