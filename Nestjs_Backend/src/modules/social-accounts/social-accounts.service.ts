import { Injectable, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocialPlatform } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import axios from 'axios';

@Injectable()
export class SocialAccountsService {
  private readonly logger = new Logger(SocialAccountsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('social-sync') private syncQueue: Queue,
  ) {}

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

  // ➤ WHATSAPP HANDLER (Has specific logic)
  async handleWhatsappCallback(data: any) {
    try {
      // Data here comes from Strategy, likely containing User Token
      const res = await axios.get(
        `https://graph.facebook.com/v19.0/me?fields=id,name,accounts,whatsapp_business_accounts&access_token=${data.accessToken}`
      );
      
      const wabas = res.data.whatsapp_business_accounts?.data || [];
      
      if (wabas.length === 0) {
          this.logger.warn(`No WhatsApp Business Accounts found for user ${data.userId}`);
          throw new NotFoundException("No WhatsApp Business Accounts found.");
      }

      const waba = wabas[0]; // Select first for MVP

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
      this.logger.error("WhatsApp Link Failed", e.response?.data || e);
      throw new UnauthorizedException("Failed to link WhatsApp Account");
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