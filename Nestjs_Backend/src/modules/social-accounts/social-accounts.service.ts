import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocialPlatform } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import axios from 'axios';
import * as crypto from 'crypto';

import { Cron, CronExpression } from '@nestjs/schedule'; // ➤ Import Cron

@Injectable()
export class SocialAccountsService {
  private readonly logger = new Logger(SocialAccountsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('social-sync') private syncQueue: Queue,
  ) {}

  // ➤ TOKEN REFRESH TASK — runs nightly, refreshes expired Google (YouTube) tokens
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async refreshTokenTask() {
    this.logger.log('Checking for expired Google tokens to refresh...');

    const accounts = await this.prisma.socialAccount.findMany({
      where: {
        isActive: true,
        platform: 'YOUTUBE',
        refreshToken: { not: null },
      },
    });

    let refreshed = 0;
    for (const account of accounts) {
      try {
        const params = new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID ?? '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
          refresh_token: account.refreshToken as string,
          grant_type: 'refresh_token',
        });

        const res = await axios.post(
          'https://oauth2.googleapis.com/token',
          params.toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        );

        await this.prisma.socialAccount.update({
          where: { id: account.id },
          data: { accessToken: res.data.access_token, isActive: true },
        });

        this.logger.log(`Refreshed token for YOUTUBE @${account.username}`);
        refreshed++;
      } catch (e) {
        this.logger.error(`Token refresh failed for YOUTUBE @${account.username}: ${e.message}`);
        await this.prisma.socialAccount.update({
          where: { id: account.id },
          data: { isActive: false },
        });
      }
    }

    this.logger.log(`Token refresh complete: ${refreshed}/${accounts.length} YouTube accounts refreshed`);
  }

  // ➤ Toggle queue pause for a social account
  async togglePause(id: string, userId: string) {
    const account = await this.prisma.socialAccount.findFirst({
      where: { id, createdById: userId },
    });
    if (!account) throw new Error('Account not found');
    return this.prisma.socialAccount.update({
      where: { id },
      data: { isPaused: !account.isPaused },
      select: { id: true, isPaused: true, platform: true, username: true },
    });
  }

  // ➤ FOR TESTING: Expire token
  async expireToken(id: string) {
    return this.prisma.socialAccount.update({
      where: { id },
      data: { isActive: false, tokenExpiresAt: new Date(Date.now() - 1000) },
    });
  }

  // =================================================================
  // ➤ CALLBACK HANDLERS (Assuming Flattened Strategy Payload)
  // =================================================================

  async handleFacebookCallback(data: any) {
    try {
      this.logger.log(`Starting Facebook Page link for user ${data.userId}`);

      // 1. Exchange short-lived user token for long-lived token (60 days)
      const appId = process.env.FACEBOOK_APP_ID;
      const appSecret = process.env.FACEBOOK_APP_SECRET;
      let userToken: string = data.accessToken;

      if (appId && appSecret) {
        try {
          const tokenRes = await axios.get(
            'https://graph.facebook.com/v19.0/oauth/access_token',
            {
              params: {
                grant_type: 'fb_exchange_token',
                client_id: appId,
                client_secret: appSecret,
                fb_exchange_token: userToken,
              },
            },
          );
          userToken = tokenRes.data.access_token || userToken;
          this.logger.log('Facebook: exchanged for long-lived user token');
        } catch (e) {
          this.logger.warn(`Facebook token exchange failed: ${e.message} — using short-lived token`);
        }
      }

      // 2. Fetch pages with page-scoped access tokens
      const pagesRes = await axios.get(
        'https://graph.facebook.com/v19.0/me/accounts',
        {
          params: {
            fields: 'id,name,picture{url},access_token',
            access_token: userToken,
          },
        },
      );
      const pages: any[] = pagesRes.data.data || [];
      this.logger.log(`FB pages found: ${pages.length} — ${JSON.stringify(pages.map((p: any) => p.name))}`);

      if (pages.length === 0) {
        this.logger.error('FB_NO_PAGE: token has no pages_show_list grant or user has no Pages');
        throw new NotFoundException(
          'FB_NO_PAGE: Aucune Facebook Page trouvée. Créez une Page Facebook pour continuer.',
        );
      }

      // 3. Auto-select first page (MVP)
      const page = pages[0];
      this.logger.log(`Linking Facebook Page: ${page.id} (${page.name})`);

      return this.upsertAccount({
        userId: data.userId,
        workspaceId: data.workspaceId,
        platform: 'FACEBOOK',
        platformUserId: page.id,
        name: page.name,
        avatar: page.picture?.data?.url ?? data.avatar,
        accessToken: page.access_token, // Page-scoped token (permanent)
        refreshToken: userToken,         // Long-lived user token (for re-derivation)
      });
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      const errorDetail = e.response?.data?.error?.message || e.message;
      this.logger.error('Facebook Page Link Failed', { error: errorDetail, data: e.response?.data });
      throw new UnauthorizedException(`Facebook connection failed: ${errorDetail}`);
    }
  }

  async handleLinkedinCallback(data: any) {
    this.logger.log(`Handling LinkedIn callback for user ${data.userId}`);
    try {
      const result = await this.upsertAccount({
        userId: data.userId,
        workspaceId: data.workspaceId,
        platform: 'LINKEDIN',
        platformUserId: data.platformUserId,
        name: data.name,
        avatar: data.avatar,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      this.logger.log(`LinkedIn account upserted: ${result.id}`);
      return result;
    } catch (e) {
      this.logger.error(
        `LinkedIn Callback Upsert Failed: ${e.message}`,
        e.stack,
      );
      throw new UnauthorizedException(
        `LinkedIn connection failed: ${e.message}`,
      );
    }
  }

  async handlePinterestCallback(data: any) {
    this.logger.log(`Handling Pinterest callback for user ${data.userId}`);
    return this.upsertAccount({
      userId: data.userId,
      workspaceId: data.workspaceId,
      platform: 'PINTEREST',
      platformUserId: data.platformUserId,
      name: data.name,
      avatar: data.avatar,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  async handleDiscordCallback(data: any) {
    this.logger.log(`Handling Discord callback for user ${data.userId}`);
    return this.upsertAccount({
      userId: data.userId,
      workspaceId: data.workspaceId,
      platform: 'DISCORD',
      platformUserId: data.platformUserId,
      name: data.name,
      avatar: data.avatar,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  async handleThreadsCallback(data: any) {
    this.logger.log(`Handling Threads callback for user ${data.userId}`);
    return this.upsertAccount({
      userId: data.userId,
      workspaceId: data.workspaceId,
      platform: 'THREADS',
      platformUserId: data.platformUserId,
      name: data.name,
      avatar: data.avatar,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  async handleSnapchatCallback(data: any) {
    this.logger.log(`Handling Snapchat callback for user ${data.userId}`);
    return this.upsertAccount({
      userId: data.userId,
      workspaceId: data.workspaceId,
      platform: 'SNAPCHAT',
      platformUserId: data.platformUserId,
      name: data.name,
      avatar: data.avatar,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  async handleTwitterCallback(data: any) {
    this.logger.log(`Handling Twitter callback for user ${data.userId}`);
    return this.upsertAccount({
      userId: data.userId,
      workspaceId: data.workspaceId,
      platform: 'TWITTER',
      platformUserId: data.platformUserId,
      name: data.name,
      avatar: data.avatar,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  async handleYoutubeCallback(data: any) {
    return this.upsertAccount({
      userId: data.userId,
      workspaceId: data.workspaceId,
      platform: 'YOUTUBE',
      platformUserId: data.platformUserId,
      name: data.name,
      avatar: data.avatar,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  async handleTikTokCallback(data: any) {
    return this.upsertAccount({
      userId: data.userId,
      workspaceId: data.workspaceId,
      platform: 'TIKTOK',
      platformUserId: data.platformUserId,
      name: data.name,
      avatar: data.avatar,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    });
  }

  async handleInstagramCallback(data: any) {
    try {
      this.logger.log(`Starting Instagram link for user ${data.userId}`);
      // 1. Get Facebook Pages
      const pagesRes = await axios.get(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account&access_token=${data.accessToken}`,
      );
      const pages = pagesRes.data.data || [];

      this.logger.debug(
        `Found ${pages.length} Facebook Pages for IG discovery`,
      );

      // 2. Find Page with Instagram Account
      const pageWithIg = pages.find((p: any) => p.instagram_business_account);

      if (!pageWithIg) {
        this.logger.warn(
          `No Instagram Business Account linked to any Facebook Page for user ${data.userId}`,
        );
        throw new NotFoundException('IG_NO_BUSINESS_ACCOUNT');
      }

      const igId = pageWithIg.instagram_business_account.id;
      this.logger.log(`Found linked IG Business Account: ${igId}`);

      // 3. Get Instagram Account Details
      const igRes = await axios.get(
        `https://graph.facebook.com/v19.0/${igId}?fields=id,username,profile_picture_url&access_token=${data.accessToken}`,
      );
      const igData = igRes.data;

      return this.upsertAccount({
        userId: data.userId,
        workspaceId: data.workspaceId,
        platform: 'INSTAGRAM',
        platformUserId: igId,
        name: igData.username || 'Instagram User',
        avatar: igData.profile_picture_url,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      const errorDetail = e.response?.data?.error?.message || e.message;
      this.logger.error('Instagram Link Failed', {
        error: errorDetail,
        data: e.response?.data,
      });
      throw new UnauthorizedException('IG_API_ERROR');
    }
  }

  async handleInstagramBusinessCallback(data: any) {
    this.logger.log(`Starting Instagram Business link for user ${data.userId}`);
    try {
      return await this.upsertAccount({
        userId: data.userId,
        workspaceId: data.workspaceId,
        platform: 'INSTAGRAM',
        platformUserId: data.platformUserId,
        name: data.name,
        avatar: data.avatar,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    } catch (e) {
      const errorDetail = e.response?.data?.error?.message || e.message;
      this.logger.error('Instagram Business Link Failed', {
        error: errorDetail,
      });
      throw new UnauthorizedException(
        `Instagram Business link failed: ${errorDetail}`,
      );
    }
  }

  // ➤ WHATSAPP HANDLER (Has specific logic)
  async handleWhatsappCallback(data: any) {
    try {
      this.logger.log(`Starting WhatsApp link for user ${data.userId}`);

      // 1. Fetch WABAs via dedicated edge (more robust than fields on /me)
      const res = await axios.get(
        `https://graph.facebook.com/v19.0/me/whatsapp_business_accounts?access_token=${data.accessToken}`,
      );

      const wabas = res.data.data || [];
      this.logger.debug(`Found ${wabas.length} WhatsApp Business Accounts`);

      if (wabas.length === 0) {
        this.logger.warn(
          `No WhatsApp Business Accounts found for user ${data.userId}`,
        );
        throw new NotFoundException(
          'No WhatsApp Business Account found. Ensure you have a WhatsApp Business account set up in your Meta Business Manager.',
        );
      }

      const waba = wabas[0]; // Select first for MVP
      this.logger.log(`Linking WABA: ${waba.id} (${waba.name})`);

      return this.upsertAccount({
        userId: data.userId,
        workspaceId: data.workspaceId,
        platform: 'WHATSAPP',
        platformUserId: waba.id,
        name: waba.name || 'WhatsApp Business',
        avatar: data.avatar, // Fallback to User avatar
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    } catch (e) {
      const errorDetail = e.response?.data?.error?.message || e.message;
      this.logger.error('WhatsApp Link Failed', {
        error: errorDetail,
        data: e.response?.data,
      });

      if (e instanceof NotFoundException) throw e;
      throw new UnauthorizedException(`WhatsApp link failed: ${errorDetail}`);
    }
  }

  // =================================================================
  // ➤ INSTAGRAM WEBHOOK
  // =================================================================

  handleInstagramWebhook(signature: string, body: any) {
    this.logger.log(`Instagram webhook received: ${JSON.stringify(body)}`);

    // Signature verification
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    if (appSecret && signature) {
      const expected =
        'sha256=' +
        crypto
          .createHmac('sha256', appSecret)
          .update(JSON.stringify(body))
          .digest('hex');
      if (signature !== expected) {
        this.logger.warn('Instagram webhook signature mismatch — ignoring');
        return { status: 'ignored' };
      }
    }

    const entries: any[] = body.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        this.logger.log(
          `IG webhook event: field=${change.field} value=${JSON.stringify(change.value)}`,
        );
      }
      for (const msg of entry.messaging || []) {
        this.logger.log(`IG DM event: ${JSON.stringify(msg)}`);
      }
    }

    return { status: 'ok' };
  }

  // =================================================================
  // ➤ TIKTOK WEBHOOK
  // =================================================================

  async handleTikTokWebhook(body: any) {
    const event: string = body?.event ?? '';
    const videoId: string = body?.video_id ?? '';
    const publishId: string = body?.publish_id ?? '';

    this.logger.log(`TikTok webhook raw: ${JSON.stringify(body)}`);
    this.logger.log(`TikTok webhook: event=${event} video_id=${videoId} publish_id=${publishId}`);

    const statusMap: Record<string, string> = {
      'video.publish.complete': 'PUBLISHED',
      'video.upload.complete': 'PUBLISHED',
      'post.publish.inbox_delivered': 'PUBLISHED',
      'video.publish.failed': 'FAILED',
      'video.upload.failed': 'FAILED',
    };

    const newStatus = statusMap[event];
    if (!newStatus) return { status: 'ok' };

    // Match by video_id (direct post) or publish_id (inbox delivery)
    const where = videoId
      ? { platformPostId: videoId }
      : publishId
        ? { platformPostId: publishId }
        : null;

    if (!where) return { status: 'ok' };

    await this.prisma.postSocialAccount.updateMany({
      where,
      data: { status: newStatus as any },
    });

    return { status: 'ok' };
  }

  // =================================================================
  // ➤ INTERNAL HELPER: UPSERT ACCOUNT
  // =================================================================
  private async upsertAccount(params: {
    userId: string;
    workspaceId?: string;
    platform: SocialPlatform;
    platformUserId: string;
    name: string;
    avatar?: string;
    accessToken: string;
    refreshToken?: string;
  }) {
    // 1. Resolve Workspace
    let workspaceId = params.workspaceId;
    if (!workspaceId) {
      const user = await this.prisma.user.findUnique({
        where: { id: params.userId },
        include: { ownedWorkspaces: true },
      });
      if (!user || user.ownedWorkspaces.length === 0) {
        throw new NotFoundException('No workspace found for user');
      }
      workspaceId = user.ownedWorkspaces[0].id;
    }

    // 2. Upsert to DB
    const isNew = !(await this.prisma.socialAccount.findUnique({
      where: {
        workspaceId_platform_platformUserId: {
          workspaceId,
          platform: params.platform,
          platformUserId: params.platformUserId,
        },
      },
    }));

    const account = await this.prisma.socialAccount.upsert({
      where: {
        workspaceId_platform_platformUserId: {
          workspaceId,
          platform: params.platform,
          platformUserId: params.platformUserId,
        },
      },
      update: {
        accessToken: params.accessToken,
        refreshToken: params.refreshToken || undefined,
        username: params.name,
        avatar: params.avatar,
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        workspaceId,
        createdById: params.userId,
        platform: params.platform,
        platformUserId: params.platformUserId,
        username: params.name,
        avatar: params.avatar,
        accessToken: params.accessToken,
        refreshToken: params.refreshToken,
        displayName: params.name,
        isActive: true,
      },
    });

    if (isNew) {
      await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: { currentSocialAccountCount: { increment: 1 } },
      });
    }

    // 3. Queue Sync
    await this.queueSyncJob(account);
    return account;
  }

  // =================================================================
  // ➤ LIST & MANAGE
  // =================================================================

  async findAll(userId: string, workspaceId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedWorkspaces: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.ownedWorkspaces.length) return [];

    // ➤ LOGIC FIX: Prefer the requested workspaceId, fallback to [0] only if missing
    const targetWorkspaceId = workspaceId || user.ownedWorkspaces[0].id;

    // Security check: Ensure user actually owns/belongs to this workspace
    // (Simplified check for now, ideally check membership)
    const hasAccess = user.ownedWorkspaces.some(
      (w) => w.id === targetWorkspaceId,
    );
    if (workspaceId && !hasAccess) {
      // Silent fail or empty array to prevent leaks
      return [];
    }

    return this.prisma.socialAccount.findMany({
      where: { workspaceId: targetWorkspaceId },
    });
  }

  async disconnect(accountId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedWorkspaces: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const account = await this.prisma.socialAccount.findFirst({
      where: {
        id: accountId,
        workspaceId: { in: user.ownedWorkspaces.map((w) => w.id) },
      },
    });

    if (!account) {
      throw new NotFoundException('Account not found or access denied');
    }
    return this.prisma.socialAccount.delete({ where: { id: accountId } });
  }

  async triggerManualSync(accountId: string, _userId: string) {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) throw new NotFoundException('Account not found');

    await this.queueSyncJob(account);
    return { status: 'Sync started', accountId };
  }

  // =================================================================
  // ➤ FACEBOOK SPECIFIC (Pages Logic)
  // =================================================================

  async getFacebookPages(userAccessToken: string): Promise<any[]> {
    try {
      const res = await axios.get(
        `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,picture{url},access_token&access_token=${userAccessToken}`,
      );
      return res.data.data || [];
    } catch (error) {
      const errorDetail = error.response?.data?.error?.message || error.message;
      this.logger.error('FB Graph Error:', { error: errorDetail });
      throw new UnauthorizedException(`Failed to fetch Facebook pages: ${errorDetail}`);
    }
  }

  async linkPageAccount(
    userId: string,
    pageData: { pageId: string; pageName: string; pageAccessToken: string; workspaceId?: string },
  ) {
    return this.upsertAccount({
      userId,
      workspaceId: pageData.workspaceId,
      platform: 'FACEBOOK',
      platformUserId: pageData.pageId,
      name: pageData.pageName,
      accessToken: pageData.pageAccessToken,
      avatar: `https://graph.facebook.com/${pageData.pageId}/picture?type=normal&access_token=${pageData.pageAccessToken}`,
    });
  }

  // =================================================================
  // ➤ QUEUE HELPER
  // =================================================================
  private async queueSyncJob(account: any) {
    try {
      await this.syncQueue.add(
        'fetch-history',
        {
          socialAccountId: account.id,
          platform: account.platform,
          accessToken: account.accessToken,
          externalId: account.platformUserId,
        },
        { priority: 1, removeOnComplete: true },
      );
      this.logger.log(
        `Queued sync for account: ${account.username} (${account.platform})`,
      );
    } catch (error) {
      this.logger.error(`Failed to queue sync: ${error.message}`);
    }
  }
}
