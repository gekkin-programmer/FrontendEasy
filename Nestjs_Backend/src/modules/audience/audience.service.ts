import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AudienceSegment, SocialPlatform } from '@prisma/client';

@Injectable()
export class AudienceService {
  constructor(private prisma: PrismaService) {}

  async getTopFans(workspaceId: string, limit: number = 10) {
    return this.prisma.audienceMember.findMany({
      where: { workspaceId },
      orderBy: { loyaltyScore: 'desc' },
      take: limit,
      include: {
        _count: {
          select: { interactions: true },
        },
      },
    });
  }

  async getSegmentationStats(workspaceId: string) {
    const counts = await this.prisma.audienceMember.groupBy({
      by: ['segment'],
      where: { workspaceId },
      _count: { _all: true },
    });

    const formatted = {
      FAN: 0,
      REGULAR: 0,
      OCCASIONAL: 0,
      INACTIVE: 0,
    };

    counts.forEach((c) => {
      formatted[c.segment] = c._count._all;
    });

    return formatted;
  }

  async trackInteraction(
    workspaceId: string,
    data: {
      platform: SocialPlatform;
      platformUserId: string;
      username: string;
      displayName?: string;
      avatar?: string;
      type: 'LIKE' | 'COMMENT' | 'SHARE' | 'CLICK';
      postId?: string;
    },
  ) {
    // 1. Find or create audience member
    const member = await this.prisma.audienceMember.upsert({
      where: {
        workspaceId_platform_platformUserId: {
          workspaceId,
          platform: data.platform,
          platformUserId: data.platformUserId,
        },
      },
      update: {
        username: data.username,
        displayName: data.displayName,
        avatar: data.avatar,
        lastInteractionAt: new Date(),
      },
      create: {
        workspaceId,
        platform: data.platform,
        platformUserId: data.platformUserId,
        username: data.username,
        displayName: data.displayName,
        avatar: data.avatar,
        lastInteractionAt: new Date(),
      },
    });

    // 2. Create interaction
    const weightMap = { LIKE: 1, COMMENT: 3, SHARE: 5, CLICK: 2 };
    await this.prisma.audienceInteraction.create({
      data: {
        audienceMemberId: member.id,
        postId: data.postId,
        type: data.type,
        weight: weightMap[data.type] || 1,
      },
    });

    // 3. Recalculate scores & segment
    await this.updateMemberLoyalty(member.id);

    return member;
  }

  private async updateMemberLoyalty(memberId: string) {
    const member = await this.prisma.audienceMember.findUnique({
      where: { id: memberId },
      include: {
        interactions: true,
        workspace: {
          select: {
            _count: {
              select: { posts: true },
            },
          },
        },
      },
    });

    if (!member) return;

    // A. Engagement Score: Simple weighted sum
    const engagementScore = member.interactions.reduce(
      (sum, i) => sum + i.weight,
      0,
    );

    // B. Loyalty Score Factors
    // 1. Consistency: (posts engaged with / total posts)
    const uniquePostsEngaged = new Set(
      member.interactions.map((i) => i.postId).filter((id) => !!id),
    ).size;
    const totalWorkspacePosts = member.workspace._count.posts || 1;
    const consistency = (uniquePostsEngaged / totalWorkspacePosts) * 100;

    // 2. Frequency: Interactions per week (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentInteractions = member.interactions.filter(
      (i) => i.createdAt >= thirtyDaysAgo,
    ).length;
    const frequency = (recentInteractions / 4) * 10; // Normalized

    // 3. Tenure: Days since first interaction
    const firstInteraction = member.interactions.reduce(
      (min, i) => (i.createdAt < min ? i.createdAt : min),
      new Date(),
    );
    const tenureDays = Math.floor(
      (new Date().getTime() - firstInteraction.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const tenureScore = Math.min(tenureDays, 100);

    // Final Loyalty Score (Average of factors)
    const loyaltyScore =
      consistency * 0.5 + frequency * 0.3 + tenureScore * 0.2;

    // C. Segmentation
    let segment: AudienceSegment = AudienceSegment.INACTIVE;
    if (loyaltyScore > 80) segment = AudienceSegment.FAN;
    else if (loyaltyScore > 50) segment = AudienceSegment.REGULAR;
    else if (loyaltyScore > 20) segment = AudienceSegment.OCCASIONAL;

    await this.prisma.audienceMember.update({
      where: { id: memberId },
      data: {
        engagementScore,
        loyaltyScore,
        segment,
      },
    });
  }

  // --- MOCK SYNC (For Prototype) ---
  async syncAudience(workspaceId: string) {
    // In a real app, this would iterate through social accounts and call APIs
    const mockData = [
      {
        platformUserId: 'f1',
        username: 'SuperFan_99',
        displayName: 'John Doe',
        type: 'LIKE',
      },
      {
        platformUserId: 'f1',
        username: 'SuperFan_99',
        displayName: 'John Doe',
        type: 'COMMENT',
      },
      {
        platformUserId: 'f2',
        username: 'TechGuru',
        displayName: 'Alex Smith',
        type: 'SHARE',
      },
      {
        platformUserId: 'f3',
        username: 'Lurker_01',
        displayName: 'Sarah W.',
        type: 'LIKE',
      },
    ];

    for (const item of mockData) {
      await this.trackInteraction(workspaceId, {
        platform: SocialPlatform.FACEBOOK,
        platformUserId: item.platformUserId,
        username: item.username,
        displayName: item.displayName,
        type: item.type as any,
      });
    }

    return { message: 'Sync complete (Mocked)' };
  }
}
