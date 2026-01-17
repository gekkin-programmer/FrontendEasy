import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FacebookService } from '../platforms/facebook.service';
// Ensure these imports match the files we just fixed above
import { SocialPlatform } from '../../../common/enums/social-platform.enum';
import { PostStatus } from '../../../common/enums/post-status.enum';
import { NormalizedSocialPost } from '../interfaces/social-platform.interface'; // <--- Import this

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
  ) {
    super();
  }

  async process(job: Job<SyncJobData>): Promise<void> {
    const { socialAccountId, platform, accessToken, externalId } = job.data;
    this.logger.log(`[Job ${job.id}] Starting history sync for ${platform}: ${externalId}`);

    try {
      const account = await this.prisma.socialAccount.findUnique({
        where: { id: socialAccountId },
        select: { workspaceId: true, createdById: true }
      });

      if (!account) {
        throw new Error(`SocialAccount ${socialAccountId} not found`);
      }

      // ➤ FIX: Explicitly type the array here
      let posts: NormalizedSocialPost[] = []; 

      switch (platform) {
        case SocialPlatform.FACEBOOK:
          posts = await this.facebookService.getHistory(accessToken, externalId);
          break;
        default:
          this.logger.warn(`Platform ${platform} sync not implemented yet.`);
          return;
      }

      this.logger.log(`Fetched ${posts.length} posts. Upserting to Database...`);

      // 3. Batch Persist (Upsert)
      await this.prisma.$transaction(
        posts.map((post) =>
          this.prisma.post.upsert({
            where: {
              // Ensure your schema.prisma has @@unique([socialAccountId, externalId])
              socialAccountId_externalId: {
                socialAccountId: socialAccountId,
                externalId: post.externalId
              }
            },
            update: {
              metrics: post.engagement,
              metaData: post.metadata
            },
            create: {
              content: post.content,
              mediaUrls: post.mediaUrls,
              socialAccountId: socialAccountId,
              workspaceId: account.workspaceId,
              createdById: account.createdById,
              status: PostStatus.PUBLISHED,
              publishedAt: post.publishedAt,
              externalId: post.externalId,
              platform: platform,
              metaData: post.metadata,
              metrics: post.engagement
            },
          }),
        ),
      );

      await this.prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: { lastSyncedAt: new Date() },
      });

      this.logger.log(`[Job ${job.id}] Sync complete.`);
    } catch (error) {
      this.logger.error(`[Job ${job.id}] Sync failed: ${error.message}`);
      throw error;
    }
  }
}