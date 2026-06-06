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
        this.logger.error(
          `Token refresh failed for YOUTUBE @${account.username}: ${e.message}`,
        );
        await this.prisma.socialAccount.update({
          where: { id: account.id },
          data: { isActive: false },
        });
      }
    }

    this.logger.log(
      `Token refresh complete: ${refreshed}/${accounts.length} YouTube accounts refreshed`,
    );
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
          this.logger.warn(
            `Facebook token exchange failed: ${e.message} — using short-lived token`,
          );
        }
      }

      // 2. Fetch pages with page-scoped access tokens
      const pagesRes = await axios.get(
        'https://graph.facebook.com/v19.0/me/accounts',
        {
          params: {
            fields: 'id,name,picture{url},access_token,tasks',
            limit: 100,
            access_token: userToken,
          },
        },
      );
      const pages: any[] = pagesRes.data.data || [];
      // Log FB user ID to cross-reference with the Facebook account in Business Manager
      this.logger.log(
        `FB /me/accounts: found=${pages.length} fbUserId=${data.platformUserId} pages=${JSON.stringify(pages.map((p: any) => ({ id: p.id, name: p.name, tasks: p.tasks })))}`,
      );

      if (pages.length === 0) {
        // Distinguish between "user declined permission" vs "user has no Pages" —
        // the recovery path is different for each case.
        let pagesPermissionGranted = false;
        try {
          const permRes = await axios.get(
            'https://graph.facebook.com/v19.0/me/permissions',
            {
              params: { access_token: userToken },
            },
          );
          const perms: Array<{ permission: string; status: string }> =
            permRes.data.data || [];
          const pagesGrant = perms.find(
            (p) => p.permission === 'pages_show_list',
          );
          pagesPermissionGranted = pagesGrant?.status === 'granted';
          this.logger.log(
            `FB permissions check: pages_show_list=${pagesGrant?.status ?? 'missing'} — all: ${JSON.stringify(perms.map((p) => `${p.permission}:${p.status}`))}`,
          );
        } catch (permErr) {
          this.logger.warn(
            `Could not fetch FB permissions: ${permErr.message}`,
          );
        }

        if (!pagesPermissionGranted) {
          // User declined pages_show_list — revoke so next consent shows fresh dialog
          this.logger.error(
            'FB_PERMISSION_DENIED: user declined pages_show_list grant',
          );
          try {
            await axios.delete(
              'https://graph.facebook.com/v19.0/me/permissions',
              {
                params: { access_token: userToken },
              },
            );
            this.logger.log(
              'Revoked Facebook app permissions — next connect will show full consent',
            );
          } catch (revokeErr) {
            this.logger.warn(
              `Could not revoke FB permissions: ${revokeErr.message}`,
            );
          }
          throw new NotFoundException('FB_PERMISSION_DENIED');
        }

        // pages_show_list is granted but /me/accounts is empty.
        // Common cause: the page belongs to a Meta Business Portfolio rather than
        // being a personal page — /me/accounts only returns personal-role pages.
        // Try the Business Graph API as a fallback before giving up.
        this.logger.warn(
          'FB_NO_PAGES_EXISTS: /me/accounts empty — trying Business Portfolio API fallback',
        );
        try {
          const bizRes = await axios.get(
            'https://graph.facebook.com/v19.0/me/businesses',
            {
              params: {
                fields:
                  'id,name,owned_pages{id,name,access_token,picture{url}}',
                limit: 100,
                access_token: userToken,
              },
            },
          );
          const businesses: any[] = bizRes.data.data || [];
          this.logger.log(
            `FB businesses found: ${businesses.length} — ${JSON.stringify(businesses.map((b: any) => b.name))}`,
          );

          for (const biz of businesses) {
            const bizPages: any[] = biz.owned_pages?.data || [];
            if (bizPages.length > 0) {
              const page = bizPages[0];
              this.logger.log(
                `Found Business Portfolio page: ${page.id} (${page.name})`,
              );
              return this.upsertAccount({
                userId: data.userId,
                workspaceId: data.workspaceId,
                platform: 'FACEBOOK',
                platformUserId: page.id,
                name: page.name,
                avatar: page.picture?.data?.url ?? data.avatar,
                accessToken: page.access_token,
                refreshToken: userToken,
              });
            }
          }
          this.logger.warn(
            'Business Portfolio API: no pages found in any business',
          );
        } catch (bizErr) {
          this.logger.warn(
            `Business Portfolio API failed: ${bizErr.response?.data?.error?.message ?? bizErr.message}`,
          );
        }

        // Fallback 3: try to fetch the page token directly using the page ID
        // that the user's Facebook profile is known to be admin of.
        // Works for Business Portfolio pages when /me/accounts and /me/businesses fail.
        // GET /{page_id}?fields=access_token works as long as the user has pages_show_list
        // and is an admin of the page, regardless of portfolio ownership.
        const knownPageIds: string[] = (process.env.FB_KNOWN_PAGE_IDS ?? '')
          .split(',')
          .filter(Boolean);
        for (const knownPageId of knownPageIds) {
          try {
            this.logger.log(
              `FB direct page fetch: trying known page ID ${knownPageId}`,
            );
            const directRes = await axios.get(
              `https://graph.facebook.com/v19.0/${knownPageId}`,
              {
                params: {
                  fields: 'id,name,access_token,picture{url}',
                  access_token: userToken,
                },
              },
            );
            const directPage = directRes.data;
            if (directPage?.access_token) {
              this.logger.log(
                `FB direct page fetch succeeded: ${directPage.id} (${directPage.name})`,
              );
              return this.upsertAccount({
                userId: data.userId,
                workspaceId: data.workspaceId,
                platform: 'FACEBOOK',
                platformUserId: directPage.id,
                name: directPage.name,
                avatar: directPage.picture?.data?.url ?? data.avatar,
                accessToken: directPage.access_token,
                refreshToken: userToken,
              });
            }
          } catch (directErr) {
            this.logger.warn(
              `FB direct page fetch for ${knownPageId} failed: ${directErr.response?.data?.error?.message ?? directErr.message}`,
            );
          }
        }

        // Still nothing — revoke so the next OAuth shows a fresh consent dialog
        try {
          await axios.delete(
            'https://graph.facebook.com/v19.0/me/permissions',
            {
              params: { access_token: userToken },
            },
          );
          this.logger.log(
            'FB app revoked — next connect will show full consent with page selection',
          );
        } catch (revokeErr) {
          this.logger.warn(
            `Could not revoke FB permissions: ${revokeErr.message}`,
          );
        }
        throw new NotFoundException('FB_NO_PAGES_EXISTS');
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
        refreshToken: userToken, // Long-lived user token (for re-derivation)
      });
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      const errorDetail = e.response?.data?.error?.message || e.message;
      this.logger.error('Facebook Page Link Failed', {
        error: errorDetail,
        data: e.response?.data,
      });
      throw new UnauthorizedException(
        `Facebook connection failed: ${errorDetail}`,
      );
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

      // Primary strategy: use the stored Facebook page token to query the
      // page's instagram_business_account directly. This avoids /me/accounts
      // which breaks when the OAuth page-grant scope is emptied by re-consent flows.
      const storedFb = await this.prisma.socialAccount.findFirst({
        where: { createdById: data.userId, platform: 'FACEBOOK' },
        orderBy: { createdAt: 'desc' },
      });

      if (storedFb?.accessToken && storedFb?.platformUserId) {
        const pageId = storedFb.platformUserId;
        const pageToken = storedFb.accessToken;

        this.logger.log(
          `Querying IG Business Account via page token for page ${pageId} (${storedFb.username})`,
        );

        try {
          const pageRes = await axios.get(
            `https://graph.facebook.com/v19.0/${pageId}`,
            {
              params: {
                fields: 'id,name,instagram_business_account',
                access_token: pageToken,
              },
            },
          );

          const pageData = pageRes.data;
          this.logger.log(
            `Page query result: id=${pageData.id} name=${pageData.name} hasIg=${!!pageData.instagram_business_account} igId=${pageData.instagram_business_account?.id ?? 'none'}`,
          );

          if (pageData.instagram_business_account?.id) {
            const igId = pageData.instagram_business_account.id;

            const igRes = await axios.get(
              `https://graph.facebook.com/v19.0/${igId}`,
              {
                params: {
                  fields: 'id,username,profile_picture_url',
                  access_token: pageToken,
                },
              },
            );
            const igData = igRes.data;
            this.logger.log(
              `Found Instagram Business Account: @${igData.username} (${igId})`,
            );

            const resolvedWorkspaceId =
              data.workspaceId || storedFb.workspaceId;
            this.logger.log(
              `Instagram will be saved to workspace ${resolvedWorkspaceId}`,
            );

            return this.upsertAccount({
              userId: data.userId,
              workspaceId: resolvedWorkspaceId,
              platform: 'INSTAGRAM',
              platformUserId: igId,
              name: igData.username || 'Instagram User',
              avatar: igData.profile_picture_url,
              accessToken: pageToken,
              refreshToken: storedFb.refreshToken ?? undefined,
            });
          }

          // Page exists but has no linked Instagram Business Account
          this.logger.warn(
            `${pageId} has no instagram_business_account — falling through to fresh token scan`,
          );
        } catch (pageErr) {
          // FB error code 100 means the ID is a user profile, not a page (field doesn't exist on users).
          // Fall through to the fresh-token /me/accounts scan below.
          const fbCode = pageErr.response?.data?.error?.code;
          this.logger.warn(
            `Page query for ${pageId} failed (fbCode=${fbCode ?? 'unknown'}: ${pageErr.response?.data?.error?.message ?? pageErr.message}) — falling through to fresh token scan`,
          );
        }
      }

      // Fallback: scan /me/accounts with the fresh token from this OAuth callback.
      // Works when the stored FB account is a user-profile (no page token) or when
      // the page query above yielded nothing.
      this.logger.log(
        'IG fallback: scanning /me/accounts with fresh IG OAuth token',
      );
      const freshPagesRes = await axios.get(
        'https://graph.facebook.com/v19.0/me/accounts',
        {
          params: {
            fields: 'id,name,instagram_business_account',
            limit: 100,
            access_token: data.accessToken, // fresh short-lived token from this OAuth
          },
        },
      );
      const freshPages: any[] = freshPagesRes.data.data || [];
      this.logger.log(`IG /me/accounts scan: found ${freshPages.length} pages`);

      const pageWithIg = freshPages.find(
        (p: any) => p.instagram_business_account?.id,
      );
      if (!pageWithIg) {
        this.logger.warn(
          `No page with instagram_business_account found for user ${data.userId}`,
        );
        throw new NotFoundException('IG_NO_BUSINESS_ACCOUNT');
      }

      const igId = pageWithIg.instagram_business_account.id;
      const igRes = await axios.get(
        `https://graph.facebook.com/v19.0/${igId}`,
        {
          params: {
            fields: 'id,username,profile_picture_url',
            access_token: data.accessToken,
          },
        },
      );
      const igData = igRes.data;
      this.logger.log(
        `IG fallback found: @${igData.username} (${igId}) via page ${pageWithIg.name}`,
      );

      return this.upsertAccount({
        userId: data.userId,
        workspaceId: data.workspaceId || storedFb?.workspaceId,
        platform: 'INSTAGRAM',
        platformUserId: igId,
        name: igData.username || 'Instagram User',
        avatar: igData.profile_picture_url,
        accessToken: data.accessToken,
        refreshToken: data.accessToken,
      });
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      const errorDetail = e.response?.data?.error?.message || e.message;
      const fbErrorCode = e.response?.data?.error?.code;
      this.logger.error(
        `Instagram Link Failed — code:${fbErrorCode} msg:${errorDetail} raw:${JSON.stringify(e.response?.data ?? {})}`,
      );
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
    this.logger.log(
      `TikTok webhook: event=${event} video_id=${videoId} publish_id=${publishId}`,
    );

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

    // 2. Check for a cross-workspace duplicate (same platform + platformUserId, different workspace).
    // This happens when a session drop during OAuth saved the account to the wrong workspace.
    // Migrate it to the intended workspace rather than creating a second orphaned record.
    const crossWsDuplicate = await this.prisma.socialAccount.findFirst({
      where: {
        createdById: params.userId,
        platform: params.platform,
        platformUserId: params.platformUserId,
        NOT: { workspaceId },
      },
    });
    if (crossWsDuplicate) {
      this.logger.warn(
        `Migrating ${params.platform} account ${params.platformUserId} from workspace ${crossWsDuplicate.workspaceId} → ${workspaceId}`,
      );
      const migrated = await this.prisma.socialAccount.update({
        where: { id: crossWsDuplicate.id },
        data: {
          workspaceId,
          accessToken: params.accessToken,
          refreshToken: params.refreshToken || undefined,
          username: params.name,
          avatar: params.avatar,
          isActive: true,
          updatedAt: new Date(),
        },
      });
      await this.queueSyncJob(migrated);
      return migrated;
    }

    // 3. Normal upsert within the target workspace
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
      throw new UnauthorizedException(
        `Failed to fetch Facebook pages: ${errorDetail}`,
      );
    }
  }

  async linkPageAccount(
    userId: string,
    pageData: {
      pageId: string;
      pageName: string;
      pageAccessToken: string;
      workspaceId?: string;
    },
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
