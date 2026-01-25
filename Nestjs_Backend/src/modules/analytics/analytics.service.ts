import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AnalyticsFilterDto, AnalyticsPeriod, AnalyticsType } from './dto/analytics-query.dto';
import { PostStatus } from '@prisma/client';

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
        return this.getTopPosts(workspaceId, dateRange, filters.limit || 50);
      default:
        return this.getOverviewAnalytics(workspaceId, dateRange);
    }
  }

  // =================================================================
  // STANDARD ANALYTICS (Overview, Accounts, Posts)
  // =================================================================

  public async getOverviewAnalytics(workspaceId: string, dateRange: { startDate: Date, endDate: Date }) {
    const whereCondition = {
      workspaceId,
      createdAt: { gte: dateRange.startDate, lte: dateRange.endDate },
      status: PostStatus.PUBLISHED,
    };

    const [totalPosts, engagementStats, scheduledPosts] = await Promise.all([
      this.prisma.post.count({ where: whereCondition }),
      // ➤ FIX: Include socialAccounts to get metrics
      this.prisma.post.findMany({
        where: whereCondition,
        include: { 
          socialAccounts: {
            select: { likes: true, comments: true, shares: true, views: true }
          }
        }
      }),
      this.prisma.post.count({ where: { workspaceId, status: PostStatus.SCHEDULED } })
    ]);

    let likes = 0, comments = 0, shares = 0, views = 0;

    // ➤ FIX: Loop through connected social accounts to sum metrics
    engagementStats.forEach((post) => {
        post.socialAccounts.forEach(sa => {
            likes += sa.likes || 0;
            comments += sa.comments || 0;
            shares += sa.shares || 0;
            views += sa.views || 0;
        });
    });

    const actions = likes + comments + shares;
    const effectiveViews = views || (actions > 0 ? actions * 10 : 1);
    const rate = ((actions / effectiveViews) * 100).toFixed(2);

    return {
      overview: {
        totalPosts,
        totalLikes: likes,
        totalReach: views,
        engagementRate: rate + '%',
        scheduled: scheduledPosts
      },
      period: { type: 'CUSTOM', start: dateRange.startDate, end: dateRange.endDate }
    };
  }

  public async getAccountsAnalytics(workspaceId: string, dateRange: { startDate: Date, endDate: Date }) {
    // ➤ FIX: We query SocialAccount and look at PostSocialAccount (postSocialAccounts) relation
    const accounts = await this.prisma.socialAccount.findMany({
      where: { workspaceId },
      include: {
        postSocialAccounts: {
            where: { 
                publishedAt: { gte: dateRange.startDate, lte: dateRange.endDate }, 
                status: PostStatus.PUBLISHED 
            },
            select: { likes: true, views: true }
        }
      }
    });

    return accounts.map(acc => {
      let likes = 0, views = 0;
      
      // Sum metrics from the join table
      acc.postSocialAccounts.forEach(p => {
          likes += p.likes || 0;
          views += p.views || 0;
      });
      
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

  public async getTopPosts(workspaceId: string, dateRange: { startDate: Date, endDate: Date }, limit: number) {
    const posts = await this.prisma.post.findMany({
      where: {
        workspaceId,
        status: PostStatus.PUBLISHED,
        createdAt: { gte: dateRange.startDate, lte: dateRange.endDate }
      },
      take: Number(limit),
      orderBy: { publishedAt: 'desc' },
      select: {
          id: true,
          content: true,
          publishedAt: true,
          status: true,
          mediaUrls: true,
          // ➤ FIX: Fetch relation instead of 'metrics' JSON
          socialAccounts: { 
            select: { 
                socialAccount: { select: { platform: true } },
                likes: true, comments: true, shares: true, views: true
            } 
          }
      }
    });

    return posts.map(p => {
        // Aggregate metrics from all platforms this post was sent to
        let totalLikes = 0;
        let totalComments = 0;
        let totalShares = 0;
        
        p.socialAccounts.forEach(sa => {
            totalLikes += sa.likes;
            totalComments += sa.comments;
            totalShares += sa.shares;
        });

        return {
            id: p.id,
            content: p.content,
            mediaUrls: p.mediaUrls,
            publishedAt: p.publishedAt,
            status: p.status,
            // Just take the first platform as the label, or "MULTI"
            platform: p.socialAccounts.length > 1 ? 'MULTI' : (p.socialAccounts[0]?.socialAccount.platform || 'UNKNOWN'),
            metrics: {
                likes: totalLikes,
                comments: totalComments,
                shares: totalShares
            }
        };
    });
  }

  // =================================================================
  // ➤ STRATEGIC INSIGHTS
  // =================================================================

  public async analyzeBestTimes(workspaceId: string) {
    const posts = await this.prisma.post.findMany({
      where: { workspaceId, status: PostStatus.PUBLISHED, publishedAt: { not: null } },
      select: { 
          publishedAt: true, 
          socialAccounts: { select: { likes: true, comments: true, shares: true } } 
      }
    });

    const heatMap = {}; 

    posts.forEach(post => {
      if (!post.publishedAt) return;
      
      const date = new Date(post.publishedAt);
      const day = date.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = date.getHours(); 
      const key = `${day}-${hour}`;
      
      // Sum engagement
      let engagement = 0;
      post.socialAccounts.forEach(sa => {
          engagement += (sa.likes || 0) + (sa.comments || 0) + (sa.shares || 0);
      });

      if (!heatMap[key]) heatMap[key] = { count: 0, totalEng: 0 };
      heatMap[key].count++;
      heatMap[key].totalEng += engagement;
    });

    return Object.entries(heatMap)
        .map(([key, data]: any) => {
            const [day, hour] = key.split('-');
            return {
                day,
                hour: parseInt(hour),
                avgEngagement: Math.round(data.totalEng / data.count),
                sampleSize: data.count
            };
        })
        .sort((a, b) => b.avgEngagement - a.avgEngagement)
        .slice(0, 10);
  }

  public async analyzeHashtags(workspaceId: string) {
    const posts = await this.prisma.post.findMany({
      where: { workspaceId, status: PostStatus.PUBLISHED },
      select: { 
          content: true, 
          socialAccounts: { select: { likes: true, comments: true } }
      }
    });

    const tagStats = {};

    posts.forEach(post => {
        if (!post.content) return;
        const tags = post.content.match(/#[a-z0-9_]+/gi); 
        if (!tags) return;

        let engagement = 0;
        post.socialAccounts.forEach(sa => {
            engagement += (sa.likes || 0) + (sa.comments || 0);
        });

        tags.forEach(t => {
            const tag = t.toLowerCase();
            if (!tagStats[tag]) tagStats[tag] = { count: 0, totalEng: 0 };
            tagStats[tag].count++;
            tagStats[tag].totalEng += engagement;
        });
    });

    return Object.entries(tagStats)
        .map(([tag, data]: any) => ({
            tag,
            postsCount: data.count,
            avgEngagement: Math.round(data.totalEng / data.count)
        }))
        .filter(t => t.postsCount > 1)
        .sort((a, b) => b.avgEngagement - a.avgEngagement)
        .slice(0, 15);
  }

  public async analyzeContentMix(workspaceId: string) {
    const posts = await this.prisma.post.findMany({
      where: { workspaceId, status: PostStatus.PUBLISHED },
      select: { 
          mediaUrls: true, 
          socialAccounts: { select: { likes: true, comments: true } }
      }
    });

    const stats = {
        TEXT: { count: 0, totalEng: 0 },
        IMAGE: { count: 0, totalEng: 0 },
        CAROUSEL: { count: 0, totalEng: 0 },
    };

    posts.forEach(post => {
        let engagement = 0;
        post.socialAccounts.forEach(sa => {
            engagement += (sa.likes || 0) + (sa.comments || 0);
        });
        
        const mediaCount = Array.isArray(post.mediaUrls) ? (post.mediaUrls as any[]).length : 0;
        let type = 'TEXT';
        if (mediaCount === 1) type = 'IMAGE';
        if (mediaCount > 1) type = 'CAROUSEL';

        if(stats[type]) {
            stats[type].count++;
            stats[type].totalEng += engagement;
        }
    });

    return Object.entries(stats).map(([type, data]) => ({
        type,
        count: data.count,
        avgEngagement: data.count > 0 ? Math.round(data.totalEng / data.count) : 0
    }));
  }

  // =================================================================
  // ➤ ADVANCED: ACCOUNT HEALTH
  // =================================================================
  public async analyzeAccountHealth(workspaceId: string) {
    const posts = await this.prisma.post.findMany({
      where: { workspaceId, status: PostStatus.PUBLISHED, publishedAt: { not: null } },
      select: { publishedAt: true },
      orderBy: { publishedAt: 'asc' }
    });

    if (posts.length < 2) return { healthScore: 0, consistency: 'New 🐣', streak: 0 };

    let totalGapHours = 0;
    let maxGapHours = 0;
    const gaps: number[] = [];

    for (let i = 1; i < posts.length; i++) {
        const prevDate = posts[i-1].publishedAt;
        const currDate = posts[i].publishedAt;

        if (!prevDate || !currDate) continue;

        const prev = new Date(prevDate).getTime();
        const curr = new Date(currDate).getTime();
        const diffHours = (curr - prev) / (1000 * 60 * 60);
        
        gaps.push(diffHours);
        totalGapHours += diffHours;
        if(diffHours > maxGapHours) maxGapHours = diffHours;
    }

    const avgGap = totalGapHours / (gaps.length || 1);
    const variance = gaps.reduce((acc, val) => acc + Math.pow(val - avgGap, 2), 0) / (gaps.length || 1);
    const stdDev = Math.sqrt(variance);

    let score = 100 - (stdDev / 2); 
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    let status = 'Inconsistent 📉';
    if (score > 80) status = 'Machine 🤖';
    else if (score > 60) status = 'Regular 📅';
    else if (score > 40) status = 'Casual ☕';

    return {
        healthScore: Math.round(score),
        consistencyStatus: status,
        avgPostingGap: Math.round(avgGap) + ' hours',
        totalPosts: posts.length,
        lastPost: posts[posts.length - 1].publishedAt
    };
  }

  // =================================================================
  // ➤ ADVANCED: PREDICTIVE FORECAST
  // =================================================================
  public async calculateGrowthForecast(workspaceId: string) {
    const posts = await this.prisma.post.findMany({
      where: { workspaceId, status: PostStatus.PUBLISHED, publishedAt: { not: null } },
      select: { 
          publishedAt: true, 
          socialAccounts: { select: { likes: true, comments: true } }
      },
      orderBy: { publishedAt: 'asc' },
      take: 50
    });

    if (posts.length < 5) return { trend: 'Not enough data', nextMonthEstimate: 0 };

    const dataPoints = posts.map((p, i) => {
        let engagement = 0;
        p.socialAccounts.forEach(sa => {
            engagement += (sa.likes || 0) + (sa.comments || 0);
        });

        return { x: i, y: engagement };
    });

    const n = dataPoints.length;
    const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
    const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
    const sumXY = dataPoints.reduce((acc, p) => acc + (p.x * p.y), 0);
    const sumXX = dataPoints.reduce((acc, p) => acc + (p.x * p.x), 0);

    const denominator = (n * sumXX - sumX * sumX);
    if (denominator === 0) return { trend: 'Flat', nextMonthEstimate: 0 };

    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;

    const nextPostIndex = n + 10;
    const predictedEngagement = (slope * nextPostIndex) + intercept;
    
    const trendDirection = slope > 0 ? 'Growing 🚀' : slope < 0 ? 'Declining 📉' : 'Stagnant ➡️';

    return {
        trend: trendDirection,
        currentAvgEngagement: Math.round(sumY / n),
        forecastNextMonth: Math.round(predictedEngagement > 0 ? predictedEngagement : 0),
        growthVelocity: slope.toFixed(2) + ' engagements per post'
    };
  }

  // =================================================================
  // ➤ ADVANCED: SMART COPY
  // =================================================================
  public async analyzeSmartCopy(workspaceId: string) {
    const posts = await this.prisma.post.findMany({
      where: { workspaceId, status: PostStatus.PUBLISHED },
      select: { 
          content: true, 
          socialAccounts: { select: { likes: true, comments: true } }
      }
    });

    if (posts.length === 0) return [];

    const totalEng = posts.reduce((acc, p) => {
        let eng = 0;
        p.socialAccounts.forEach(sa => eng += (sa.likes || 0) + (sa.comments || 0));
        return acc + eng;
    }, 0);
    
    const avgEng = totalEng / posts.length;

    const winners = posts.filter(p => {
        let eng = 0;
        p.socialAccounts.forEach(sa => eng += (sa.likes || 0) + (sa.comments || 0));
        return eng > avgEng;
    });

    const stopWords = ['the', 'and', 'is', 'in', 'to', 'for', 'of', 'with', 'a', 'le', 'la', 'les', 'et', 'de', 'en', 'un', 'une', 'je', 'tu', 'il', 'nous', 'vous'];
    const wordScores = {};

    winners.forEach(p => {
        if (!p.content) return;
        const words = p.content.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/);
        
        words.forEach(w => {
            if (w.length > 3 && !stopWords.includes(w)) {
                wordScores[w] = (wordScores[w] || 0) + 1;
            }
        });
    });

    return Object.entries(wordScores)
        .map(([word, score]) => ({ word, impactScore: score }))
        .sort((a: any, b: any) => b.impactScore - a.impactScore)
        .slice(0, 10);
  }

  // --- HELPER ---
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
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); 
    }
    return { startDate, endDate };
  }
}