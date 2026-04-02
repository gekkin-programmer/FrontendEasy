// @ts-nocheck - Recycling fields/models not yet in Prisma schema; @google/generative-ai not installed
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecyclingService {
  private readonly logger = new Logger(RecyclingService.name);
  private genAI: GoogleGenerativeAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  // 1. Identify Top Performing Posts
  async getRecyclableCandidates(workspaceId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const posts = await this.prisma.post.findMany({
      where: {
        workspaceId,
        status: PostStatus.PUBLISHED,
        publishedAt: { lte: thirtyDaysAgo },
        recycleCount: { lt: 3 },
      },
      include: {
        socialAccounts: {
          select: { likes: true, comments: true, shares: true, views: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return posts
      .map((post) => {
        const score = this.calculatePerformanceScore(post);
        return { ...post, performanceScore: score };
      })
      .filter((p) => p.performanceScore >= 50 || p.isEvergreen)
      .sort((a, b) => b.performanceScore - a.performanceScore);
  }

  // 2. AI Variation Generator (Gemini Version)
  async generateVariation(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    if (!this.genAI) {
      this.logger.warn('Google API Key missing, returning original content');
      return {
        originalContent: post.content,
        newContent: post.content,
        originalPostId: post.id,
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });
      const prompt = `
          Rewrite the following social media post to give it a fresh angle while maintaining the core message.
          Include a strong hook and a clear call to action.
          Original content: "${post.content}"
          Format: Return only the new content text.
        `;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return {
        originalContent: post.content,
        newContent: text.trim(),
        originalPostId: post.id,
      };
    } catch (error) {
      this.logger.error(`Gemini Error: ${error.message}`);
      return {
        originalContent: post.content,
        newContent: post.content,
        originalPostId: post.id,
      };
    }
  }

  // 3. Automation: Recycle Post
  async recyclePost(postId: string, userId: string, scheduledFor: Date) {
    const originalPost = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { socialAccounts: { include: { socialAccount: true } } },
    });

    if (!originalPost) throw new NotFoundException('Original post not found');

    const variation = await this.generateVariation(postId);
    const content = variation.newContent || originalPost.content;

    const newPost = await this.prisma.post.create({
      data: {
        workspaceId: originalPost.workspaceId,
        content: content,
        status: PostStatus.SCHEDULED,
        scheduledFor,
        createdById: userId,
        originalPostId: postId,
        socialAccounts: {
          create: originalPost.socialAccounts.map((sa) => ({
            socialAccountId: sa.socialAccountId,
            status: PostStatus.SCHEDULED,
          })),
        },
      },
    });

    await this.prisma.post.update({
      where: { id: postId },
      data: { recycleCount: { increment: 1 } },
    });

    return newPost;
  }

  async toggleEvergreen(postId: string, status: boolean) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { isEvergreen: status },
    });
  }

  private calculatePerformanceScore(post: any): number {
    let likes = 0,
      comments = 0,
      shares = 0,
      views = 0;

    post.socialAccounts.forEach((sa) => {
      likes += sa.likes || 0;
      comments += sa.comments || 0;
      shares += sa.shares || 0;
      views += sa.views || 0;
    });

    const engagement = likes * 1 + comments * 3 + shares * 5;
    const reach = views || (engagement > 0 ? engagement * 10 : 1);

    const score = (engagement / reach) * 1000;
    return Math.min(Math.round(score), 100);
  }
}
