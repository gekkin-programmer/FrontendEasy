import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ISocialPlatform, NormalizedSocialPost } from '../interfaces/social-platform.interface';

@Injectable()
export class TiktokService implements ISocialPlatform {
  private readonly logger = new Logger(TiktokService.name);
  private readonly BASE_URL = 'https://open.tiktokapis.com/v2';

  constructor(private readonly httpService: HttpService) {}

  async getHistory(
    accessToken: string,
    openId: string,
    since?: Date,
  ): Promise<NormalizedSocialPost[]> {
    try {
      // Fetching user's videos
      const url = `${this.BASE_URL}/video/list/`;
      const { data } = await firstValueFrom(
        this.httpService.post(
          url,
          { 
            fields: ['id', 'title', 'video_description', 'cover_image_url', 'share_url', 'create_time', 'like_count', 'comment_count', 'share_count', 'view_count'] 
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
      );

      if (!data || !data.data || !data.data.videos) return [];

      return data.data.videos.map((v: any) => ({
        externalId: v.id,
        content: v.video_description || v.title || '',
        mediaUrls: [v.cover_image_url].filter(Boolean),
        publishedAt: new Date(v.create_time * 1000),
        permalink: v.share_url,
        engagement: {
          likes: v.like_count || 0,
          comments: v.comment_count || 0,
          shares: v.share_count || 0,
          views: v.view_count || 0,
        },
        metadata: { raw: v },
      }));

    } catch (error) {
      this.logger.error(`TikTok API Error: ${error.message}`);
      return [];
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    // TikTok requires standard OAuth2 refresh
    return refreshToken; 
  }
}
