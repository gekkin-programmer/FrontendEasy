import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  ISocialPlatform,
  NormalizedSocialPost,
} from '../interfaces/social-platform.interface';

@Injectable()
export class TiktokService implements ISocialPlatform {
  private readonly logger = new Logger(TiktokService.name);
  private readonly BASE_URL = 'https://open.tiktokapis.com/v2';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  // video.list scope is not in the approved TikTok app scopes.
  // We fall back to EazyPost-published videos tracked in our own DB.
  async getHistory(
    _accessToken: string,
    openId: string,
    since?: Date,
  ): Promise<NormalizedSocialPost[]> {
    const account = await this.prisma.socialAccount.findFirst({
      where: { platformUserId: openId, platform: 'TIKTOK' },
      select: { id: true },
    });
    if (!account) return [];

    const links = await this.prisma.postSocialAccount.findMany({
      where: {
        socialAccountId: account.id,
        platformPostId: { not: null },
        status: 'PUBLISHED',
        ...(since ? { publishedAt: { gte: since } } : {}),
      },
      include: { post: true },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    return links
      .filter((l) => l.platformPostId && l.publishedAt)
      .map((l) => ({
        externalId: l.platformPostId!,
        content: l.post.content,
        mediaUrls: l.post.mediaUrls as string[],
        publishedAt: l.publishedAt!,
        permalink: l.platformPostUrl ?? undefined,
        engagement: {
          likes: l.likes,
          comments: l.comments,
          shares: l.shares,
          views: l.views,
        },
        metadata: {},
      }));
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    const params = new URLSearchParams({
      client_key: this.configService.get<string>('TIKTOK_CLIENT_KEY') ?? '',
      client_secret:
        this.configService.get<string>('TIKTOK_CLIENT_SECRET') ?? '',
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const { data } = await firstValueFrom(
      this.httpService.post(
        `${this.BASE_URL}/oauth/token/`,
        params.toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      ),
    );

    if (!data?.access_token) {
      throw new Error(`TikTok token refresh failed: ${JSON.stringify(data)}`);
    }

    return data.access_token as string;
  }
}
