import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocialPlatform } from '@prisma/client';
import axios from 'axios'; // 👈 Needed for FB Page Fetch

@Injectable()
export class SocialAccountsService {
  constructor(private prisma: PrismaService) {}

  // ➤ SAVE ACCOUNT TO DB (Facebook/LinkedIn/TikTok)
  async linkAccount(userId: string, data: any) {
    // 1. Find User's Default Workspace
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedWorkspaces: true }
    });

    if (!user || user.ownedWorkspaces.length === 0) {
      throw new NotFoundException('User has no workspace to link account to');
    }
    const workspaceId = user.ownedWorkspaces[0].id;

    const platformEnum = data.platform.toUpperCase() as SocialPlatform;

    // 🛑 FACEBOOK SPECIAL LOGIC: Get Page Tokens
    if (platformEnum === 'FACEBOOK') {
       return this.handleFacebookPages(workspaceId, userId, data.accessToken);
    }

    // 2. Standard Upsert for other platforms (LinkedIn, TikTok, YouTube)
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

    return account;
  }

  // 👇 NEW HELPER: Fetch & Save Facebook Pages
  private async handleFacebookPages(workspaceId: string, userId: string, userToken: string) {
    try {
      // 1. Fetch Pages from Graph API
      const res = await axios.get(`https://graph.facebook.com/me/accounts?access_token=${userToken}`);
      const pages = res.data.data;

      if (!pages || pages.length === 0) {
        throw new Error("No Facebook Pages found. You must be an admin of a page.");
      }

      // 2. Save EACH Page as a separate account
      const savedAccounts: any[] = [];
      
      for (const page of pages) {
        // Fetch Page Picture
        const picRes = await axios.get(`https://graph.facebook.com/${page.id}/picture?type=normal&redirect=false&access_token=${page.access_token}`);
        const avatarUrl = picRes.data.data.url;

        const account = await this.prisma.socialAccount.upsert({
          where: {
            workspaceId_platform_platformUserId: {
              workspaceId,
              platform: 'FACEBOOK',
              platformUserId: page.id // Page ID
            }
          },
          update: {
            accessToken: page.access_token, // 👈 THIS IS THE PAGE TOKEN!
            username: page.name,
            avatar: avatarUrl,
            isActive: true,
            updatedAt: new Date()
          },
          create: {
            workspaceId,
            createdById: userId,
            platform: 'FACEBOOK',
            platformUserId: page.id,
            username: page.name,
            avatar: avatarUrl,
            accessToken: page.access_token, // 👈 THIS IS THE PAGE TOKEN!
            displayName: page.name,
            isActive: true
          }
        });
        savedAccounts.push(account);
      }
      
      return savedAccounts[0]; // Return first one for controller redirect
      
    } catch (error) {
      console.error("FB Page Fetch Error", error.response?.data || error);
      throw new Error("Failed to fetch Facebook Pages");
    }
  }

  // ➤ LIST ACCOUNTS
  async findAll(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedWorkspaces: true }
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
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

    if (!account) {
      throw new NotFoundException('Account not found or access denied');
    }

    return this.prisma.socialAccount.delete({
      where: { id: accountId }
    });
  }
}