import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ISocialPlatform,
  NormalizedSocialPost,
} from '../interfaces/social-platform.interface';
import { SocialTokenExpiredException } from '../../../common/exceptions/token-expired.exception';

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
    _since?: Date,
  ): Promise<NormalizedSocialPost[]> {
    try {
      // Fetch fields including comments
      const fields =
        'id,message,created_time,full_picture,attachments{media,media_type,subattachments},shares,comments.summary(true){id,message,created_time,from},likes.summary(true),insights.metric(post_impressions_unique)';

      const url = `${this.GRAPH_URL}/${pageId}/feed?fields=${fields}&limit=50&access_token=${accessToken}`;

      const { data } = await firstValueFrom(this.httpService.get(url));

      if (!data || !data.data) return [];

      return data.data.map((post: any) => ({
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
        comments: this.extractComments(post), // Extract comments
        metadata: { raw: post },
      }));
    } catch (error) {
      this.handleFacebookError(error);
      return [];
    }
  }

  // ➤ THIS IS THE MISSING METHOD CAUSING THE BUILD ERROR
  async replyToComment(
    accessToken: string,
    commentId: string,
    message: string,
  ): Promise<string> {
    try {
      const url = `${this.GRAPH_URL}/${commentId}/comments`;
      const { data } = await firstValueFrom(
        this.httpService.post(url, { message, access_token: accessToken }),
      );
      return data.id;
    } catch (error) {
      this.logger.error(`Failed to reply to FB comment: ${error.message}`);
      throw new Error('Facebook reply failed');
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    return refreshToken;
  }

  // --- HELPERS ---

  private handleFacebookError(error: any) {
    const fbError = error.response?.data?.error;
    if (fbError && (fbError.code === 190 || fbError.code === 102)) {
      this.logger.warn(`Facebook Token Expired: ${fbError.message}`);
      throw new SocialTokenExpiredException('FACEBOOK');
    }
    this.logger.error(
      `Facebook API Error: ${fbError?.message || error.message}`,
    );
    throw new Error('Failed to fetch Facebook history');
  }

  private extractComments(post: any) {
    if (!post.comments || !post.comments.data) return [];

    return post.comments.data.map((c: any) => ({
      externalId: c.id,
      content: c.message,
      authorName: c.from?.name || 'Facebook User',
      authorId: c.from?.id,
      publishedAt: new Date(c.created_time),
    }));
  }

  private extractMedia(post: any): string[] {
    const images: string[] = [];
    if (post.attachments?.data) {
      post.attachments.data.forEach((att: any) => {
        if (att.media?.image?.src) images.push(att.media.image.src);
        if (att.subattachments?.data) {
          att.subattachments.data.forEach((sub: any) => {
            if (sub.media?.image?.src) images.push(sub.media.image.src);
          });
        }
      });
    }
    if (images.length === 0 && post.full_picture) {
      images.push(post.full_picture);
    }
    return [...new Set(images)];
  }
}
