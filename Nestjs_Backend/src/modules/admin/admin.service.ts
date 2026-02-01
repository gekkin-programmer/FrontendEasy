import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const totalUsers = await this.prisma.user.count();
    const activeUsers7d = await this.prisma.user.count({
      where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
    });
    const totalPosts = await this.prisma.post.count();
    const totalAiRequests = await this.prisma.aiUsageLog.count();

    // Growth: Users this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const newUsersMonth = await this.prisma.user.count({
      where: { createdAt: { gte: startOfMonth } }
    });

    return {
      totalUsers,
      activeUsers7d,
      totalPosts,
      totalAiRequests,
      newUsersMonth,
      growthRate: totalUsers > 0 ? (newUsersMonth / totalUsers) * 100 : 0
    };
  }

  async getAllUsers(search?: string) {
    return this.prisma.user.findMany({
      where: search ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ]
      } : {},
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        planType: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            posts: true,
            createdSocialAccounts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async grantAccess(adminId: string, data: { userId: string, planType: any, durationDays?: number, reason?: string }) {
    const expiresAt = data.durationDays 
      ? new Date(Date.now() + data.durationDays * 24 * 60 * 60 * 1000)
      : null;

    // 1. Create Grant Log
    await this.prisma.accessGrant.create({
      data: {
        userId: data.userId,
        adminId: adminId,
        planType: data.planType,
        durationDays: data.durationDays,
        expiresAt: expiresAt,
        reason: data.reason
      }
    });

    // 2. Update User Plan
    return this.prisma.user.update({
      where: { id: data.userId },
      data: {
        planType: data.planType,
        planExpiresAt: expiresAt
      }
    });
  }

  async getFeedback() {
    return this.prisma.communityFeedback.findMany({
      include: {
        author: {
          select: { firstName: true, email: true }
        },
        _count: {
          select: { upvotes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
