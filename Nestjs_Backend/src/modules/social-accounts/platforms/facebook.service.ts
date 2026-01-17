import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { ISocialPlatform, NormalizedSocialPost } from '../interfaces/social-platform.interface';

@Injectable()
export class FacebookService implements ISocialPlatform {
  private readonly logger = new Logger(FacebookService.name);
  private readonly GRAPH_URL = 'https://graph.facebook.com/v19.0';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getHistory(
    accessToken: string,
    pageId: string,
    since?: Date,
  ): Promise<NormalizedSocialPost[]> {
    try {
      // ➤ We request deeper fields to ensure we get images
      const fields = 'id,message,created_time,full_picture,attachments{media,media_type,subattachments},shares,comments.summary(true),likes.summary(true),insights.metric(post_impressions_unique)';
      
      const url = `${this.GRAPH_URL}/${pageId}/feed?fields=${fields}&limit=50&access_token=${accessToken}`;
      
      const { data } = await firstValueFrom(this.httpService.get(url));
      
      if (!data || !data.data) return [];

      return data.data.map((post: any) => ({
        externalId: post.id,
        content: post.message || '',
        mediaUrls: this.extractMedia(post), // Improved extraction
        publishedAt: new Date(post.created_time),
        engagement: {
          likes: post.likes?.summary?.total_count || 0,
          comments: post.comments?.summary?.total_count || 0,
          shares: post.shares?.count || 0,
          views: post.insights?.data?.[0]?.values?.[0]?.value || 0,
        },
        metadata: { raw: post },
      }));

    } catch (error) {
      this.logger.error(`Facebook API Error: ${error.response?.data?.error?.message || error.message}`);
      throw new Error('Failed to fetch Facebook history');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    return refreshToken; 
  }

  // ➤ IMPROVED MEDIA EXTRACTOR
  private extractMedia(post: any): string[] {
    const images: string[] = [];

    // 1. Check Attachments (Albums, Multi-photo)
    if (post.attachments?.data) {
      post.attachments.data.forEach((att: any) => {
        // Direct Image
        if (att.media?.image?.src) {
            images.push(att.media.image.src);
        }
        // Album / Subattachments
        if (att.subattachments?.data) {
            att.subattachments.data.forEach((sub: any) => {
                if (sub.media?.image?.src) {
                    images.push(sub.media.image.src);
                }
            });
        }
      });
    }

    // 2. Fallback to Full Picture (Thumbnail or Single Image)
    if (images.length === 0 && post.full_picture) {
        images.push(post.full_picture);
    }

    return images;
  }
}