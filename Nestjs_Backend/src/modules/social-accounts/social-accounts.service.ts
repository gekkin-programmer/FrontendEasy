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

  // ➤ LIST ACCOUNTS
  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedWorkspaces: true }
    });
    
    if (!user) { throw new NotFoundException('User not found'); }
    if (!user.ownedWorkspaces.length) return [];

    return this.prisma.socialAccount.findMany({
      where: { workspaceId: user.ownedWorkspaces[0].id }
    });
  }

  // ➤ DISCONNECT ACCOUNT
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

  // ➤ NEW: TRIGGER MANUAL SYNC (Called by Controller)
  async triggerManualSync(accountId: string, userId: string) {
    // Verify ownership
    const account = await this.prisma.socialAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) throw new NotFoundException('Account not found');
    
    // Add to queue
    await this.queueSyncJob(account);
    return { status: 'Sync started', accountId };
  }

  // =================================================================
  // STANDARD OAUTH LINKING
  // =================================================================
  async linkAccount(userId: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedWorkspaces: true }
    });

    if (!user || user.ownedWorkspaces.length === 0) {
      throw new NotFoundException('User has no workspace to link account to');
    }
    const workspaceId = user.ownedWorkspaces[0].id;
    const platformEnum = data.platform.toUpperCase() as SocialPlatform;

    if (platformEnum === 'FACEBOOK') {
       return { status: 'selection_required', accessToken: data.accessToken };
    }

    const account = await this.prisma.socialAccount.upsert({
      where: {
        workspaceId_platform_platformUserId: {
          workspaceId,
          platform: platformEnum,
          platformUserId: data.platformUserId
        }
      },
      update: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || undefined,
        username: data.name,
        avatar: data.avatar,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        workspaceId,
        createdById: userId,
        platform: platformEnum,
        platformUserId: data.platformUserId,
        username: data.name,
        avatar: data.avatar,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        displayName: data.name,
        isActive: true
      }
    });

    await this.queueSyncJob(account);
    return account;
  }

  // =================================================================
  // FACEBOOK PAGE LOGIC
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
    const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { ownedWorkspaces: true }
    });
  
    if (!user || user.ownedWorkspaces.length === 0) {
        throw new NotFoundException('User has no workspace');
    }
    const workspaceId = user.ownedWorkspaces[0].id;

    let avatarUrl = '';
    try {
        const picRes = await axios.get(`https://graph.facebook.com/${pageData.pageId}/picture?type=normal&redirect=false&access_token=${pageData.pageAccessToken}`);
        avatarUrl = picRes.data.data.url;
    } catch (e) { this.logger.warn("Could not fetch page avatar"); }

    const account = await this.prisma.socialAccount.upsert({
        where: {
          workspaceId_platform_platformUserId: {
            workspaceId,
            platform: 'FACEBOOK',
            platformUserId: pageData.pageId
          }
        },
        update: {
          accessToken: pageData.pageAccessToken, 
          username: pageData.pageName,
          avatar: avatarUrl,
          isActive: true,
          updatedAt: new Date()
        },
        create: {
          workspaceId,
          createdById: userId,
          platform: 'FACEBOOK',
          platformUserId: pageData.pageId,
          username: pageData.pageName,
          avatar: avatarUrl,
          accessToken: pageData.pageAccessToken,
          displayName: pageData.pageName,
          isActive: true
        }
    });

    await this.queueSyncJob(account);
    return account;
  }

  /**
   * Helper to push job to Redis Queue (Internal)
   */
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