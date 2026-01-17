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
      // 1. Define fields to fetch to save bandwidth
      const fields = 'id,message,created_time,full_picture,attachments,shares,comments.summary(true),likes.summary(true),insights.metric(post_impressions_unique)';
      
      const url = `${this.GRAPH_URL}/${pageId}/feed?fields=${fields}&limit=20&access_token=${accessToken}`;
      
      // 2. Fetch from Graph API
      const { data } = await firstValueFrom(this.httpService.get(url));
      
      if (!data || !data.data) {
        return [];
      }

      const rawPosts = data.data;

      // 3. Normalize Data for EasyPost
      return rawPosts.map((post: any) => ({
        externalId: post.id,
        content: post.message || '',
        mediaUrls: this.extractMedia(post),
        publishedAt: new Date(post.created_time),
        engagement: {
          likes: post.likes?.summary?.total_count || 0,
          comments: post.comments?.summary?.total_count || 0,
          shares: post.shares?.count || 0,
          views: post.insights?.data?.[0]?.values?.[0]?.value || 0,
        },
        metadata: {
          raw: post, // Store raw data for future AI slang detection
        },
      }));

    } catch (error) {
      this.logger.error(`Facebook API Error: ${error.response?.data?.error?.message || error.message}`);
      // In a real scenario, check if error is "Token Expired" and throw specific error
      throw new Error('Failed to fetch Facebook history');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    // Implement Long-Lived Token exchange here if needed
    return refreshToken; 
  }

  private extractMedia(post: any): string[] {
    // Helper to get high-quality images
    if (post.attachments?.data) {
      return post.attachments.data
        .map((att: any) => att.media?.image?.src || att.media?.source)
        .filter(Boolean);
    }
    return post.full_picture ? [post.full_picture] : [];
  }
}