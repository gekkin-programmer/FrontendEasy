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
        media: { include: { media: true } } // Include media!
      }
    });

    if (!post) return;

    let successCount = 0;
    
    // Prepare Media (Get first image/video URL if exists)
    const mediaUrl = post.media.length > 0 ? post.media[0].media.url : undefined;
    const isVideo = post.media.length > 0 && post.media[0].media.mimeType.startsWith('video');

    for (const postAccount of post.socialAccounts) {
      const account = postAccount.socialAccount;
      
      try {
        this.logger.log(` Publishing to ${account.platform}...`);

        let platformPostId = '';

        switch (account.platform) {
            case 'FACEBOOK':
                platformPostId = await this.postToFacebook(account.accessToken, account.platformUserId, post.content, mediaUrl);
                break;
            case 'LINKEDIN':
                platformPostId = await this.postToLinkedIn(account.accessToken, account.platformUserId, post.content, mediaUrl);
                break;
            case 'TWITTER':
                platformPostId = await this.postToTwitter(account.accessToken, post.content);
                break;
            case 'TIKTOK':
                // TikTok API requires video. If text only, skip.
                if(!mediaUrl) throw new Error("TikTok requires a video file.");
                platformPostId = await this.postToTikTok(account.accessToken, mediaUrl);
                break;
            default:
                await this.simulateApiCall(account.platform);
        }

        // Success
        await this.prisma.postSocialAccount.update({
          where: { id: postAccount.id },
          data: { 
            status: 'PUBLISHED', 
            publishedAt: new Date(),
            platformPostId 
          }
        });
        successCount++;

      } catch (error) {
        this.logger.error(` Failed: ${account.platform}`, error.response?.data || error.message);
        
        // Handle Token Expiry
        const isAuthError = error.response?.status === 401;
        if (isAuthError) {
            await this.prisma.socialAccount.update({
                where: { id: account.id },
                data: { isActive: false } 
            });
        }

        await this.prisma.postSocialAccount.update({
          where: { id: postAccount.id },
          data: { 
            status: 'FAILED', 
            errorMessage: error.message 
          }
        });
      }
    }

    const dbStatus = successCount > 0 ? 'PUBLISHED' : 'FAILED';
    await this.prisma.post.update({
      where: { id: postId },
      data: { status: dbStatus, publishedAt: new Date() }
    });

    await this.notifyUser(post.createdById, post.content, dbStatus);
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