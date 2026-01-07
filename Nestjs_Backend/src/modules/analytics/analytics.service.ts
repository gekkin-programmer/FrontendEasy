import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsFilterDto, AnalyticsPeriod, AnalyticsType } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getAnalytics(workspaceId: string, filters: AnalyticsFilterDto) {
    const { period = AnalyticsPeriod.MONTH, type = AnalyticsType.OVERVIEW } = filters;
    const dateRange = this.getDateRange(period, filters.startDate, filters.endDate);

    switch (type) {
      case AnalyticsType.OVERVIEW:
        return this.getOverviewAnalytics(workspaceId, dateRange);
      case AnalyticsType.ACCOUNTS:
        return this.getAccountsAnalytics(workspaceId, dateRange);
      case AnalyticsType.POSTS:
        return this.getTopPosts(workspaceId, dateRange, filters.limit || 5);
      default:
        return this.getOverviewAnalytics(workspaceId, dateRange);
    }
  }

  // ➤ 1. DASHBOARD OVERVIEW (Replaces "Orders/Revenue")
  private async getOverviewAnalytics(workspaceId: string, dateRange: { startDate: Date, endDate: Date }) {
    const whereCondition = {
      workspaceId,
      createdAt: {
        gte: dateRange.startDate,
        lte: dateRange.endDate,
      },
      status: 'PUBLISHED' as const, // Only count real posts
    };

    const [
      totalPosts,
      engagementStats,
      scheduledPosts,
      platformDistribution
    ] = await Promise.all([
      // 1. Total Posts Published
      this.prisma.post.count({ where: whereCondition }),

      // 2. Total Engagement (Likes + Comments + Shares)
      // Note: We aggregate from PostSocialAccount because that's where the numbers live
      this.prisma.postSocialAccount.aggregate({
        where: { post: whereCondition },
        _sum: {
          likes: true,
          comments: true,
          shares: true,
          views: true
        }
      }),

      // 3. Pipeline (Scheduled)
      this.prisma.post.count({
        where: {
          workspaceId,
          status: 'SCHEDULED'
        }
      }),

      // 4. Posts per Platform
      this.prisma.postSocialAccount.groupBy({
        by: ['platformPostUrl'], // Trick: We need to group by account, but simplest is grouping by Post ID then mapping
        where: { post: whereCondition },
        _count: { id: true }
      })
    ]);

    // Calculate Engagement Rate (Total Actions / Total Views)
    const actions = (engagementStats._sum.likes || 0) + (engagementStats._sum.comments || 0) + (engagementStats._sum.shares || 0);
    const views = engagementStats._sum.views || 1; // Avoid divide by zero
    const rate = ((actions / views) * 100).toFixed(2);

    return {
      overview: {
        totalPosts,
        totalLikes: engagementStats._sum.likes || 0,
        totalReach: engagementStats._sum.views || 0,
        engagementRate: rate + '%',
        scheduled: scheduledPosts
      },
      period: {
        type: 'CUSTOM',
        start: dateRange.startDate,
        end: dateRange.endDate
      }
    };
  }

  // ➤ 2. ACCOUNT PERFORMANCE (Replaces "Drivers/Regions")
  private async getAccountsAnalytics(workspaceId: string, dateRange: { startDate: Date, endDate: Date }) {
    // Group metrics by Social Account
    const accounts = await this.prisma.socialAccount.findMany({
      where: { workspaceId },
      include: {
        postSocialAccounts: {
          where: {
  post: {
    createdAt: { gte: dateRange.startDate, lte: dateRange.endDate }
  }
},
          select: {
            likes: true,
            comments: true,
            views: true
          }
        }
      }
    });

    return accounts.map(acc => {
      const likes = acc.postSocialAccounts.reduce((sum, p) => sum + p.likes, 0);
      const views = acc.postSocialAccounts.reduce((sum, p) => sum + p.views, 0);
      
      return {
        id: acc.id,
        platform: acc.platform,
        username: acc.username,
        postsCount: acc.postSocialAccounts.length,
        totalEngagement: likes,
        totalReach: views,
        efficiency: views > 0 ? (likes / views).toFixed(2) : 0
      };
    });
  }

  // ➤ 3. TOP CONTENT (Replaces "Top Selling Products")
  private async getTopPosts(workspaceId: string, dateRange: { startDate: Date, endDate: Date }, limit: number) {
    const posts = await this.prisma.post.findMany({
      where: {
        workspaceId,
        status: 'PUBLISHED',
        createdAt: { gte: dateRange.startDate, lte: dateRange.endDate }
      },
      include: {
        socialAccounts: {
          select: { likes: true, comments: true, shares: true, socialAccount: { select: { platform: true } } }
        }
      },
      take: limit,
      orderBy: { createdAt: 'desc' } 
    });

    return posts.map(p => ({
      id: p.id,
      content: p.content.substring(0, 50) + '...',
      platforms: p.socialAccounts.map(sa => sa.socialAccount.platform),
      stats: {
        likes: p.socialAccounts.reduce((sum, sa) => sum + sa.likes, 0),
        comments: p.socialAccounts.reduce((sum, sa) => sum + sa.comments, 0)
      }
    })).sort((a, b) => b.stats.likes - a.stats.likes); // JS Sort if DB sort fails
  }

  // --- HELPER: DATE RANGES (Stolen from your mate's code because it's good) ---
  private getDateRange(period: AnalyticsPeriod, customStartDate?: string, customEndDate?: string) {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case AnalyticsPeriod.DAY:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case AnalyticsPeriod.WEEK:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case AnalyticsPeriod.MONTH:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case AnalyticsPeriod.YEAR:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case AnalyticsPeriod.CUSTOM:
        if (!customStartDate || !customEndDate) throw new BadRequestException('Dates required');
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Last 30 days
    }
    return { startDate, endDate };
  }
}