import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SocialPlatform } from '@prisma/client';

@Injectable()
export class SocialAccountsService {
  constructor(private prisma: PrismaService) {}

  // ➤ SAVE ACCOUNT TO DB (Facebook/LinkedIn)
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

    // 2. Normalize Platform Enum (Handle case sensitivity)
    const platformEnum = data.platform.toUpperCase() as SocialPlatform;

    // 3. Upsert (Create or Update if re-connecting)
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
        avatar: data.avatar, // Store avatar if available
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

    // Security: Ensure account belongs to user's workspace
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