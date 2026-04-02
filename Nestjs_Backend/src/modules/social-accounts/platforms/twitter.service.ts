import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  ISocialPlatform,
  NormalizedSocialPost,
} from '../interfaces/social-platform.interface';

@Injectable()
export class TwitterService implements ISocialPlatform {
  private readonly logger = new Logger(TwitterService.name);
  private readonly BASE_URL = 'https://api.twitter.com/2';

  constructor(private readonly httpService: HttpService) {}

  async getHistory(
    accessToken: string,
    twitterUserId: string,
    _since?: Date,
  ): Promise<NormalizedSocialPost[]> {
    try {
      const url = `${this.BASE_URL}/users/${twitterUserId}/tweets?max_results=50&tweet.fields=created_at,public_metrics,entities&expansions=attachments.media_keys&media.fields=url,preview_image_url`;

      const { data } = await firstValueFrom(
        this.httpService.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );

      if (!data || !data.data) return [];

      return data.data.map((tweet: any) => ({
        externalId: tweet.id,
        content: tweet.text || '',
        mediaUrls: [], // Mapping media requires expansion matching
        publishedAt: new Date(tweet.created_at),
        engagement: {
          likes: tweet.public_metrics?.like_count || 0,
          comments: tweet.public_metrics?.reply_count || 0,
          shares: tweet.public_metrics?.retweet_count || 0,
        },
        metadata: { raw: tweet },
      }));
    } catch (error) {
      this.logger.error(`Twitter API Error: ${error.message}`);
      return [];
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    return refreshToken;
  }
}
