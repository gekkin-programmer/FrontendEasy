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
    // INJECT THE QUEUE HERE
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

  // =================================================================
  // STANDARD OAUTH LINKING (LinkedIn, TikTok, YouTube)
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

    // FACEBOOK SPECIAL CASE
    if (platformEnum === 'FACEBOOK') {
       return { status: 'selection_required', accessToken: data.accessToken };
    }

    // Upsert Account
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

    // ➤ TRIGGER BACKGROUND SYNC
    await this.triggerSync(account);

    return account;
  }

  // =================================================================
  // FACEBOOK PAGE LOGIC
  // =================================================================

  // 1. Get List of Pages from Graph API
  async getFacebookPages(userAccessToken: string) {
    try {
      const res = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`);
      return res.data.data; 
    } catch (error) {
      this.logger.error("FB Graph Error:", error.response?.data || error);
      throw new UnauthorizedException("Failed to fetch Facebook Pages");
    }
  }

  // 2. Link Specific Page
  async linkPageAccount(userId: string, pageData: { pageId: string, pageName: string, pageAccessToken: string }) {
    const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { ownedWorkspaces: true }
    });
  
    if (!user || user.ownedWorkspaces.length === 0) {
        throw new NotFoundException('User has no workspace');
    }
    const workspaceId = user.ownedWorkspaces[0].id;

    // Fetch Avatar
    let avatarUrl = '';
    try {
        const picRes = await axios.get(`https://graph.facebook.com/${pageData.pageId}/picture?type=normal&redirect=false&access_token=${pageData.pageAccessToken}`);
        avatarUrl = picRes.data.data.url;
    } catch (e) { this.logger.warn("Could not fetch page avatar"); }

    // Upsert Page
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

    // ➤ TRIGGER BACKGROUND SYNC
    await this.triggerSync(account);

    return account;
  }

  /**
   * Helper to push job to Redis Queue
   */
  private async triggerSync(account: any) {
    try {
      await this.syncQueue.add(
        'fetch-history',
        {
          socialAccountId: account.id,
          platform: account.platform,
          accessToken: account.accessToken,
          externalId: account.platformUserId,
        },
        {
          priority: 1, 
          attempts: 3
        }
      );
      this.logger.log(`Queued sync for account: ${account.username} (${account.platform})`);
    } catch (error) {
      this.logger.error(`Failed to queue sync: ${error.message}`);
      // Don't throw error here, so the user still gets the "Account Connected" success message
    }
  }
}