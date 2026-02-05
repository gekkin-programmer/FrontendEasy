import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocialPlatform } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import axios from 'axios';

import { Cron, CronExpression } from '@nestjs/schedule'; // ➤ Import Cron

@Injectable()
export class SocialAccountsService {
  private readonly logger = new Logger(SocialAccountsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('social-sync') private syncQueue: Queue,
  ) {}

  // ➤ TOKEN REFRESH TASK (Test 6)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async refreshTokenTask() {
    this.logger.log('🔄 Checking for tokens needing refresh...');
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const accountsToRefresh = await this.prisma.socialAccount.findMany({
      where: {
        isActive: true,
        refreshToken: { not: null },
        tokenExpiresAt: { lte: sevenDaysFromNow }
      }
    });

    for (const account of accountsToRefresh) {
      try {
        this.logger.log(`Refreshing ${account.platform} token for @${account.username}`);
        // Platform specific refresh logic (Simplified for MVP)
        // ... call OAuth provider refresh endpoint ...
        
        // Mock update for now
        await this.prisma.socialAccount.update({
          where: { id: account.id },
          data: { updatedAt: new Date() } // Simulate token update
        });
      } catch (e) {
        this.logger.error(`Refresh failed for ${account.platform}`, e.message);
      }
    }
  }

  // ➤ FOR TESTING: Expire token
  async expireToken(id: string) {
    return this.prisma.socialAccount.update({
      where: { id },
      data: { isActive: false, tokenExpiresAt: new Date(Date.now() - 1000) }
    });
  }

  // =================================================================
  // ➤ CALLBACK HANDLERS (Assuming Flattened Strategy Payload)
  // =================================================================

  async handleFacebookCallback(data: any) {
    return this.upsertAccount({
      userId: data.userId,
      workspaceId: data.workspaceId,
      platform: 'FACEBOOK',
      platformUserId: data.platformUserId, // Flattened
      name: data.name,
      avatar: data.avatar,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    });
  }

  async handleLinkedinCallback(data: any) {
    return this.upsertAccount({
      userId: data.userId,
      workspaceId: data.workspaceId,
      platform: 'LINKEDIN',
      platformUserId: data.platformUserId,
      name: data.name,
      avatar: data.avatar,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    });
  }

  async handleTwitterCallback(data: any) {
    return this.upsertAccount({
      userId: data.userId,
      workspaceId: data.workspaceId,
      platform: 'TWITTER',
      platformUserId: data.platformUserId,
      name: data.name,
      avatar: data.avatar,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken 
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
      refreshToken: data.refreshToken
    });
  }

  async handleInstagramCallback(data: any) {
    try {
      this.logger.log(`Starting Instagram link for user ${data.userId}`);
      // 1. Get Facebook Pages
      const pagesRes = await axios.get(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account&access_token=${data.accessToken}`);
      const pages = pagesRes.data.data || [];
      
      this.logger.debug(`Found ${pages.length} Facebook Pages for IG discovery`);

      // 2. Find Page with Instagram Account
      const pageWithIg = pages.find((p: any) => p.instagram_business_account);
      
      if (!pageWithIg) {
          this.logger.warn(`No Instagram Business Account linked to any Facebook Page for user ${data.userId}`);
          throw new NotFoundException("No Instagram Business Account found. Ensure your IG Business account is linked to a Facebook Page.");
      }

      const igId = pageWithIg.instagram_business_account.id;
      this.logger.log(`Found linked IG Business Account: ${igId}`);

      // 3. Get Instagram Account Details
      const igRes = await axios.get(`https://graph.facebook.com/v19.0/${igId}?fields=id,username,profile_picture_url&access_token=${data.accessToken}`);
      const igData = igRes.data;

      return this.upsertAccount({
        userId: data.userId,
        workspaceId: data.workspaceId,
        platform: 'INSTAGRAM',
        platformUserId: igId,
        name: igData.username || 'Instagram User',
        avatar: igData.profile_picture_url,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      });

    } catch (e) {
      const errorDetail = e.response?.data?.error?.message || e.message;
      this.logger.error("Instagram Link Failed", { error: errorDetail, data: e.response?.data });
      throw new UnauthorizedException(`Instagram link failed: ${errorDetail}`);
    }
  }

  // ➤ WHATSAPP HANDLER (Has specific logic)
  async handleWhatsappCallback(data: any) {
    try {
      this.logger.log(`Starting WhatsApp link for user ${data.userId}`);
      
      // 1. Fetch WABAs via dedicated edge (more robust than fields on /me)
      const res = await axios.get(
        `https://graph.facebook.com/v19.0/me/whatsapp_business_accounts?access_token=${data.accessToken}`
      );
      
      const wabas = res.data.data || [];
      this.logger.debug(`Found ${wabas.length} WhatsApp Business Accounts`);
      
      if (wabas.length === 0) {
          this.logger.warn(`No WhatsApp Business Accounts found for user ${data.userId}`);
          throw new NotFoundException("No WhatsApp Business Account found. Ensure you have a WhatsApp Business account set up in your Meta Business Manager.");
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
        refreshToken: data.refreshToken
      });

    } catch (e) {
      const errorDetail = e.response?.data?.error?.message || e.message;
      this.logger.error("WhatsApp Link Failed", { error: errorDetail, data: e.response?.data });
      
      if (e instanceof NotFoundException) throw e;
      throw new UnauthorizedException(`WhatsApp link failed: ${errorDetail}`);
    }
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
        include: { ownedWorkspaces: true }
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
          platformUserId: params.platformUserId
        }
      }
    }));

    const account = await this.prisma.socialAccount.upsert({
      where: {
        workspaceId_platform_platformUserId: {
          workspaceId,
          platform: params.platform,
          platformUserId: params.platformUserId
        }
      },
      update: {
        accessToken: params.accessToken,
        refreshToken: params.refreshToken || undefined, 
        username: params.name,
        avatar: params.avatar,
        isActive: true,
        updatedAt: new Date()
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
        isActive: true
      }
    });

    if (isNew) {
      await this.prisma.workspace.update({
        where: { id: workspaceId },
        data: { currentSocialAccountCount: { increment: 1 } }
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
      include: { ownedWorkspaces: true }
    });
    
    if (!user) { throw new NotFoundException('User not found'); }
    if (!user.ownedWorkspaces.length) return [];

    // ➤ LOGIC FIX: Prefer the requested workspaceId, fallback to [0] only if missing
    const targetWorkspaceId = workspaceId || user.ownedWorkspaces[0].id;

    // Security check: Ensure user actually owns/belongs to this workspace
    // (Simplified check for now, ideally check membership)
    const hasAccess = user.ownedWorkspaces.some(w => w.id === targetWorkspaceId);
    if (workspaceId && !hasAccess) {
        // Silent fail or empty array to prevent leaks
        return [];
    }

    return this.prisma.socialAccount.findMany({
      where: { workspaceId: targetWorkspaceId }
    });
  }

  async disconnect(accountId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedWorkspaces: true }
    });
    if (!user) throw new NotFoundException('User not found');

    const account = await this.prisma.socialAccount.findFirst({
      where: { 
        id: accountId,
        workspaceId: { in: user.ownedWorkspaces.map(w => w.id) }
      }
    });

    if (!account) { throw new NotFoundException('Account not found or access denied'); }
    return this.prisma.socialAccount.delete({ where: { id: accountId } });
  }

  async triggerManualSync(accountId: string, userId: string) {
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) throw new NotFoundException('Account not found');
    
    await this.queueSyncJob(account);
    return { status: 'Sync started', accountId };
  }

  // =================================================================
  // ➤ FACEBOOK SPECIFIC (Pages Logic)
  // =================================================================
  
  async getFacebookPages(userAccessToken: string) {
    try {
      const res = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`);
      return res.data.data; 
    } catch (error) {
      this.logger.error("FB Graph Error:", error.response?.data || error);
      throw new UnauthorizedException("Failed to fetch Facebook Pages");
    }
  }

  async linkPageAccount(userId: string, pageData: { pageId: string, pageName: string, pageAccessToken: string }) {
    return this.upsertAccount({
      userId,
      platform: 'FACEBOOK',
      platformUserId: pageData.pageId,
      name: pageData.pageName,
      accessToken: pageData.pageAccessToken,
      avatar: `https://graph.facebook.com/${pageData.pageId}/picture?type=normal&access_token=${pageData.pageAccessToken}`
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
        { priority: 1, removeOnComplete: true }
      );
      this.logger.log(`Queued sync for account: ${account.username} (${account.platform})`);
    } catch (error) {
      this.logger.error(`Failed to queue sync: ${error.message}`);
    }
  }
}