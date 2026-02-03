import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
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

  async grantAccess(adminId: string, data: { userId?: string, email?: string, planType: any, durationDays?: number, reason?: string }) {
    let targetUserId = data.userId;

    // 0. Resolve User ID from Email if needed
    if (!targetUserId && data.email) {
      const user = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (!user) throw new NotFoundException('User with this email not found');
      targetUserId = user.id;
    }

    if (!targetUserId) throw new BadRequestException('User ID or Email is required');

    const expiresAt = data.durationDays 
      ? new Date(Date.now() + data.durationDays * 24 * 60 * 60 * 1000)
      : null;

    // 1. Create Grant Log
    await this.prisma.accessGrant.create({
      data: {
        userId: targetUserId,
        adminId: adminId,
        planType: data.planType,
        durationDays: data.durationDays,
        expiresAt: expiresAt,
        reason: data.reason
      }
    });

    // 2. Update User Plan
    return this.prisma.user.update({
      where: { id: targetUserId },
      data: {
        planType: data.planType,
        planExpiresAt: expiresAt
      }
    });
  }

  async deleteUser(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  async updateUserStatus(id: string, status: any) {
    return this.prisma.user.update({
      where: { id },
      data: { status }
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
