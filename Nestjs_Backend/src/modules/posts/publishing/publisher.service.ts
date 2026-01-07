import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SocialPlatform, PostStatus } from '@prisma/client';

@Injectable()
export class PublisherService {
  private readonly logger = new Logger(PublisherService.name);

  constructor(private prisma: PrismaService) {}

  async publishPost(postId: string) {
    // 1. Fetch Post with Tokens
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        socialAccounts: {
          include: { socialAccount: true } // Need tokens inside socialAccount
        }
      }
    });

    if (!post) return;

    let successCount = 0;
    let failCount = 0;

    // 2. Loop through targeted platforms
    for (const postAccount of post.socialAccounts) {
      const account = postAccount.socialAccount;
      
      try {
        this.logger.log(` Publishing to ${account.platform} (${account.username})...`);

        // ==========================================================
        // 🛑 REAL API CALLS GO HERE
        // You would use 'account.accessToken' to call Graph API / LinkedIn API
        // ==========================================================
        await this.simulateApiCall(account.platform);
        // ==========================================================

        // 3a. Success Update
        await this.prisma.postSocialAccount.update({
          where: { id: postAccount.id },
          data: { 
            status: 'PUBLISHED', 
            publishedAt: new Date() 
          }
        });
        successCount++;

      } catch (error) {
        this.logger.error(`❌ Failed to publish to ${account.platform}`, error);
        
        // 3b. Failure Update
        await this.prisma.postSocialAccount.update({
          where: { id: postAccount.id },
          data: { 
            status: 'FAILED', 
            errorMessage: error.message 
          }
        });
        failCount++;
      }
    }

    // 4. Update Main Post Status
    const finalStatus = failCount === 0 ? 'PUBLISHED' : (successCount > 0 ? 'PARTIALLY_FAILED' : 'FAILED'); // You might need to add PARTIALLY_FAILED to Enum if you want precise tracking, otherwise use PUBLISHED or FAILED
    
    // Note: If you don't have PARTIALLY_FAILED in Enum, use PUBLISHED if at least 1 succeeded
    const dbStatus = successCount > 0 ? 'PUBLISHED' : 'FAILED';

    await this.prisma.post.update({
      where: { id: postId },
      data: { 
        status: dbStatus,
        publishedAt: new Date()
      }
    });

    // 5. Send Notification to User
    await this.notifyUser(post.createdById, post.content, dbStatus);
  }

  // --- Helpers ---

  private async simulateApiCall(platform: string) {
    return new Promise((resolve) => setTimeout(resolve, 1000)); // Mock 1s delay
  }

  private async notifyUser(userId: string, content: string, status: string) {
    const title = status === 'PUBLISHED' ? 'Post Published! 🎉' : 'Post Failed ❌';
    const message = `Your post "${content.substring(0, 20)}..." has been processed with status: ${status}`;

    await this.prisma.notification.create({
      data: {
        userId,
        type: status === 'PUBLISHED' ? 'POST_PUBLISHED' : 'POST_FAILED',
        title,
        message,
        isRead: false
      }
    });
  }
}