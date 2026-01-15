import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocialPlatform } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class SocialAccountsService {
  constructor(private prisma: PrismaService) {}

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

    //  FACEBOOK SPECIAL CASE: Just return, don't save yet.
    // The Controller will redirect to the frontend selection modal instead.
    if (platformEnum === 'FACEBOOK') {
       return { status: 'selection_required', accessToken: data.accessToken };
    }

    // Standard Upsert for others
    return this.prisma.socialAccount.upsert({
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
  }

  // =================================================================
  // FACEBOOK PAGE LOGIC
  // =================================================================

  // 1. Get List of Pages from Graph API
  async getFacebookPages(userAccessToken: string) {
    try {
      const res = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${userAccessToken}`);
      return res.data.data; // Array of { name, id, access_token, category }
    } catch (error) {
      console.error("FB Graph Error:", error.response?.data || error);
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

    // Fetch Avatar for the Page
    let avatarUrl = '';
    try {
        const picRes = await axios.get(`https://graph.facebook.com/${pageData.pageId}/picture?type=normal&redirect=false&access_token=${pageData.pageAccessToken}`);
        avatarUrl = picRes.data.data.url;
    } catch (e) { console.warn("Could not fetch page avatar"); }

    return this.prisma.socialAccount.upsert({
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
  }
}