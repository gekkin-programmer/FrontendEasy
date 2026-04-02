import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackStatus } from '@prisma/client';

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async createFeedback(userId: string, dto: CreateFeedbackDto) {
    return this.prisma.communityFeedback.create({
      data: {
        authorId: userId,
        ...dto,
      },
    });
  }

  async getRoadmap() {
    // Returns feedback items with upvote counts and basic info
    const items = await this.prisma.communityFeedback.findMany({
      include: {
        author: {
          select: { firstName: true, avatar: true },
        },
        _count: {
          select: { upvotes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      ...item,
      upvotes: item._count.upvotes,
    }));
  }

  async toggleUpvote(userId: string, feedbackId: string) {
    const existing = await this.prisma.feedbackUpvote.findUnique({
      where: {
        feedbackId_userId: { feedbackId, userId },
      },
    });

    if (existing) {
      // Remove upvote
      await this.prisma.feedbackUpvote.delete({
        where: {
          feedbackId_userId: { feedbackId, userId },
        },
      });
      return { upvoted: false };
    } else {
      // Add upvote
      await this.prisma.feedbackUpvote.create({
        data: { feedbackId, userId },
      });
      return { upvoted: true };
    }
  }

  // --- ADMIN ---
  async updateStatus(id: string, status: FeedbackStatus) {
    const item = await this.prisma.communityFeedback.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Feedback not found');

    return this.prisma.communityFeedback.update({
      where: { id },
      data: { status },
    });
  }

  async getTopContributors() {
    return this.prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        avatar: true,
        _count: {
          select: {
            posts: true,
            communityFeedback: true,
          },
        },
      },
      orderBy: [
        { posts: { _count: 'desc' } },
        { communityFeedback: { _count: 'desc' } },
      ],
    });
  }
}
