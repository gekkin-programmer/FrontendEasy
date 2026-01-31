import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { SocialPlatform } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class PublisherService {
  private readonly logger = new Logger(PublisherService.name);

  constructor(private prisma: PrismaService) {}

  async publishPost(postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        socialAccounts: { include: { socialAccount: true } },
        media: { include: { media: true } }
      }
    });

    if (!post) return;

    // 1. Double Publication Protection
    if (post.status === 'PUBLISHED') {
        this.logger.warn(`Post ${postId} already published. Skipping.`);
        return;
    }

    let successCount = 0;
    const retryLimit = 2;
    
    // Prepare Media
    const mediaUrl = post.media.length > 0 ? post.media[0].media.url : undefined;

    for (const postAccount of post.socialAccounts) {
      const account = postAccount.socialAccount;
      
      // Skip if already published for this specific account (in case of partial retry)
      if (postAccount.status === 'PUBLISHED') {
          successCount++;
          continue;
      }

      let attempts = 0;
      let platformPostId = '';
      let lastError = '';

      while (attempts < retryLimit && !platformPostId) {
        try {
            attempts++;
            this.logger.log(` Publishing to ${account.platform} (Attempt ${attempts})...`);

            const formattedContent = this.formatContent(post.content, account.platform);

            switch (account.platform) {
                case 'FACEBOOK':
                    platformPostId = await this.postToFacebook(account.accessToken, account.platformUserId, formattedContent, mediaUrl);
                    break;
                case 'LINKEDIN':
                    platformPostId = await this.postToLinkedIn(account.accessToken, account.platformUserId, formattedContent, mediaUrl);
                    break;
                case 'TWITTER':
                    platformPostId = await this.postToTwitter(account.accessToken, formattedContent);
                    break;
                case 'TIKTOK':
                    if(!mediaUrl) throw new Error("TikTok requires a video file.");
                    platformPostId = await this.postToTikTok(account.accessToken, mediaUrl);
                    break;
                default:
                    await this.simulateApiCall(account.platform);
                    platformPostId = 'simulated-id';
            }
        } catch (error) {
            lastError = error.response?.data?.message || error.message;
            this.logger.error(` Attempt ${attempts} failed for ${account.platform}: ${lastError}`);
            
            // If OAuth Error (401), don't retry
            if (error.response?.status === 401) {
                await this.prisma.socialAccount.update({
                    where: { id: account.id },
                    data: { isActive: false } 
                });
                break; 
            }
            
            // Wait before retry
            if (attempts < retryLimit) await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (platformPostId) {
        await this.prisma.postSocialAccount.update({
          where: { id: postAccount.id },
          data: { 
            status: 'PUBLISHED', 
            publishedAt: new Date(),
            platformPostId,
            errorMessage: null
          }
        });
        successCount++;
      } else {
        await this.prisma.postSocialAccount.update({
          where: { id: postAccount.id },
          data: { 
            status: 'FAILED', 
            errorMessage: lastError 
          }
        });
      }
    }

    const dbStatus = successCount === post.socialAccounts.length ? 'PUBLISHED' : (successCount > 0 ? 'PUBLISHED' : 'FAILED');
    // Note: status is PUBLISHED even if partial, to avoid infinite retry loops in cron
    // A better way would be 'PARTIALLY_PUBLISHED' but let's keep it simple for MVP.

    await this.prisma.post.update({
      where: { id: postId },
      data: { status: dbStatus, publishedAt: successCount > 0 ? new Date() : null }
    });

    await this.notifyUser(post.createdById, post.content, dbStatus);
  }

  private formatContent(content: string, platform: string): string {
    if (platform === 'TWITTER' && content.length > 280) {
      return content.substring(0, 277) + '...';
    }
    return content;
  }

  // =================================================================
  // 1. FACEBOOK (Graph API)
  // =================================================================
  private async postToFacebook(token: string, pageId: string, message: string, imageUrl?: string) {
    const endpoint = imageUrl 
        ? `https://graph.facebook.com/${pageId}/photos`
        : `https://graph.facebook.com/${pageId}/feed`;
    
    const body: any = { access_token: token, message };
    if (imageUrl) body.url = imageUrl;

    const res = await axios.post(endpoint, body);
    return res.data.id;
  }

  // =================================================================
  // 2. LINKEDIN (UGC API)
  // =================================================================
  private async postToLinkedIn(token: string, personUrn: string, text: string, imageUrl?: string) {
    // Note: LinkedIn Image Upload is complex (3 steps: Register -> Upload -> Create).
    // For MVP/MVO, we support TEXT ONLY or URL Preview.
    // If you need real Image Upload, it requires a much larger service.
    
    const body = {
        author: `urn:li:person:${personUrn}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
            "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text },
                shareMediaCategory: "NONE"
            }
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" }
    };

    const res = await axios.post('https://api.linkedin.com/v2/ugcPosts', body, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.id;
  }

  // =================================================================
  // 3. TWITTER / X (API v2)
  // =================================================================
  private async postToTwitter(token: string, text: string) {
    const res = await axios.post('https://api.twitter.com/2/tweets', { text }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.data.id;
  }

  // =================================================================
  // 4. TIKTOK (Video Upload)
  // =================================================================
  private async postToTikTok(token: string, videoUrl: string) {
    // TikTok Share API initiates a video from a URL
    const res = await axios.post('https://open.tiktokapis.com/v2/video/upload/url/', {
        source_info: { source: "FILE_URL", video_url: videoUrl }
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.publish_id;
  }

  private async simulateApiCall(platform: string) {
    return new Promise((resolve) => setTimeout(resolve, 1000)); 
  }

  private async notifyUser(userId: string, content: string, status: string) {
    await this.prisma.notification.create({
      data: {
        userId,
        type: status === 'PUBLISHED' ? 'POST_PUBLISHED' : 'POST_FAILED',
        title: status,
        message: content.substring(0, 30),
        isRead: false
      }
    });
  }
}