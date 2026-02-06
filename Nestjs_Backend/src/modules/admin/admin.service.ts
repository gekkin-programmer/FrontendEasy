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
    // 1. Manually cleanup dependencies without Cascade Delete in schema
    await this.prisma.socialAccount.deleteMany({ where: { createdById: id } });
    await this.prisma.task.deleteMany({ where: { OR: [{ createdById: id }, { assignedToId: id }] } });
    await this.prisma.mediaLibrary.deleteMany({ where: { uploaderId: id } });
    await this.prisma.chatMessage.deleteMany({ where: { senderId: id } });
    await this.prisma.activityLog.deleteMany({ where: { userId: id } });
    
    // ➤ FIX: Handle relations where user was an admin or creator
    await this.prisma.accessGrant.deleteMany({ where: { adminId: id } });
    await this.prisma.post.deleteMany({ where: { createdById: id } });
    
    // 2. Delete user (Triggers Cascade for Workspaces, Received Grants, Transactions, etc.)
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

  async cleanupDatabase() {
    // 1. Identify users to DELETE (Non-admins)
    const usersToDelete = await this.prisma.user.findMany({
      where: { NOT: { role: 'ADMIN' } },
      select: { id: true }
    });
    const userIds = usersToDelete.map(u => u.id);

    if (userIds.length === 0) return { message: 'Database already clean' };

    // 2. Cleanup dependencies without Cascade
    await this.prisma.socialAccount.deleteMany({ where: { createdById: { in: userIds } } });
    await this.prisma.task.deleteMany({ where: { OR: [{ createdById: { in: userIds } }, { assignedToId: { in: userIds } }] } });
    await this.prisma.mediaLibrary.deleteMany({ where: { uploaderId: { in: userIds } } });
    await this.prisma.chatMessage.deleteMany({ where: { senderId: { in: userIds } } });
    await this.prisma.activityLog.deleteMany({ where: { userId: { in: userIds } } });
    await this.prisma.session.deleteMany({ where: { userId: { in: userIds } } });
    
    // ➤ FIX: Cleanup grants issued BY these users and posts created BY them
    await this.prisma.accessGrant.deleteMany({ where: { adminId: { in: userIds } } });
    await this.prisma.post.deleteMany({ where: { createdById: { in: userIds } } });

    // 3. Delete users (Triggers Cascade for Workspaces, Posts, etc.)
    const deleted = await this.prisma.user.deleteMany({
      where: { id: { in: userIds } }
    });

    return { 
      message: 'Cleanup successful', 
      deletedCount: deleted.count 
    };
  }
}
