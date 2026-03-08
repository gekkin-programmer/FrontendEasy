import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  ISocialPlatform,
  NormalizedSocialPost,
} from '../interfaces/social-platform.interface';
import { SocialTokenExpiredException } from '../../../common/exceptions/token-expired.exception';

@Injectable()
export class InstagramService implements ISocialPlatform {
  private readonly logger = new Logger(InstagramService.name);
  private readonly GRAPH_URL = 'https://graph.facebook.com/v19.0';

  constructor(private readonly httpService: HttpService) {}

  async getHistory(
    accessToken: string,
    instagramBusinessId: string,
    since?: Date,
  ): Promise<NormalizedSocialPost[]> {
    try {
      const fields =
        'id,caption,timestamp,media_url,media_type,permalink,like_count,comments_count,comments{id,text,timestamp,from}';
      const url = `${this.GRAPH_URL}/${instagramBusinessId}/media?fields=${fields}&limit=50&access_token=${accessToken}`;

      const { data } = await firstValueFrom(this.httpService.get(url));

      if (!data || !data.data) return [];

      return data.data.map((post: any) => ({
        externalId: post.id,
        content: post.caption || '',
        mediaUrls: [post.media_url].filter(Boolean),
        publishedAt: new Date(post.timestamp),
        permalink: post.permalink,
        engagement: {
          likes: post.like_count || 0,
          comments: post.comments_count || 0,
          shares: 0, // IG Basic API doesn't easily expose share counts for media
          views: 0,
        },
        comments: this.extractComments(post),
        metadata: { raw: post },
      }));
    } catch (error) {
      this.handleInstagramError(error);
      return [];
    }
  }

  async replyToComment(
    accessToken: string,
    commentId: string,
    message: string,
  ): Promise<string> {
    try {
      const url = `${this.GRAPH_URL}/${commentId}/replies`;
      const { data } = await firstValueFrom(
        this.httpService.post(url, { message, access_token: accessToken }),
      );
      return data.id;
    } catch (error) {
      this.logger.error(`Failed to reply to IG comment: ${error.message}`);
      throw new Error('Instagram reply failed');
    }
  }

  refreshAccessToken(refreshToken: string): Promise<string> {
    return Promise.resolve(refreshToken); // Usually handled via long-lived tokens in Meta
  }

  private extractComments(post: any) {
    if (!post.comments || !post.comments.data) return [];

    return post.comments.data.map((c: any) => ({
      externalId: c.id,
      content: c.text,
      authorName: c.from?.username || 'Instagram User',
      authorId: c.from?.id,
      publishedAt: new Date(c.timestamp),
    }));
  }

  private handleInstagramError(error: any) {
    const igError = error.response?.data?.error;
    if (igError && (igError.code === 190 || igError.code === 102)) {
      throw new SocialTokenExpiredException('INSTAGRAM');
    }
    this.logger.error(
      `Instagram API Error: ${igError?.message || error.message}`,
    );
    throw new Error('Failed to fetch Instagram history');
  }
}
