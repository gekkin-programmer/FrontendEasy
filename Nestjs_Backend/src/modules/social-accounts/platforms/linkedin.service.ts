import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ISocialPlatform, NormalizedSocialPost } from '../interfaces/social-platform.interface';

@Injectable()
export class LinkedinService implements ISocialPlatform {
  private readonly logger = new Logger(LinkedinService.name);
  private readonly BASE_URL = 'https://api.linkedin.com/v2';

  constructor(private readonly httpService: HttpService) {}

  async getHistory(
    accessToken: string,
    personId: string,
    since?: Date,
  ): Promise<NormalizedSocialPost[]> {
    try {
      // LinkedIn uses URNs. Example: urn:li:person:ABC12345
      const author = `urn:li:person:${personId}`;
      const url = `${this.BASE_URL}/ugcPosts?q=authors&authors=List(${encodeURIComponent(author)})&count=50`;
      
      const { data } = await firstValueFrom(this.httpService.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      }));
      
      if (!data || !data.elements) return [];

      return data.elements.map((post: any) => ({
        externalId: post.id,
        content: post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '',
        mediaUrls: this.extractMedia(post),
        publishedAt: new Date(post.firstPublishedAt || Date.now()),
        engagement: {
          likes: 0, // Requires separate Social Actions API call
          comments: 0,
          shares: 0,
        },
        metadata: { raw: post },
      }));

    } catch (error) {
      this.logger.error(`LinkedIn API Error: ${error.message}`);
      return [];
    }
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    return refreshToken; // Standard OAuth2 refresh flow usually needed here
  }

  private extractMedia(post: any): string[] {
    const media: string[] = [];
    const content = post.specificContent?.['com.linkedin.ugc.ShareContent']?.media;
    if (Array.isArray(content)) {
        content.forEach((m: any) => {
            if (m.originalLandingPage) media.push(m.originalLandingPage);
        });
    }
    return media;
  }
}