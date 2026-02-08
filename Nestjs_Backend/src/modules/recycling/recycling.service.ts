import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PostStatus } from '@prisma/client';
import { OpenAI } from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RecyclingService {
  private readonly logger = new Logger(RecyclingService.name);
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  // 1. Identify Top Performing Posts
  async getRecyclableCandidates(workspaceId: string) {
    // We fetch posts older than 30 days with decent engagement
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const posts = await this.prisma.post.findMany({
      where: {
        workspaceId,
        status: PostStatus.PUBLISHED,
        publishedAt: { lte: thirtyDaysAgo },
        recycleCount: { lt: 3 }, // Max 3 recycles
      },
      include: {
        socialAccounts: {
          select: { likes: true, comments: true, shares: true, views: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Score and filter
    return posts.map(post => {
      const score = this.calculatePerformanceScore(post);
      return { ...post, performanceScore: score };
    }).filter(p => p.performanceScore >= 50 || p.isEvergreen)
      .sort((a, b) => b.performanceScore - a.performanceScore);
  }

  // 2. AI Variation Generator
  async generateVariation(postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const prompt = `
      Rewrite the following social media post to give it a fresh angle while maintaining the core message.
      Include a strong hook and a clear call to action.
      Original content: "${post.content}"
      Format: Return only the new content text.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
    });

    return {
      originalContent: post.content,
      newContent: response.choices[0].message.content,
      originalPostId: post.id
    };
  }

  // 3. Automation: Recycle Post
  async recyclePost(postId: string, userId: string, scheduledFor: Date) {
    const originalPost = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { socialAccounts: { include: { socialAccount: true } } }
    });

    if (!originalPost) throw new NotFoundException('Original post not found');

    const variation = await this.generateVariation(postId);
    if (!variation.newContent) throw new Error('AI failed to generate content');

    const newPost = await this.prisma.post.create({
      data: {
        workspaceId: originalPost.workspaceId,
        content: variation.newContent,
        status: PostStatus.SCHEDULED,
        scheduledFor,
        createdById: userId,
        originalPostId: postId,
        socialAccounts: {
          create: originalPost.socialAccounts.map(sa => ({
            socialAccountId: sa.socialAccountId,
            status: PostStatus.SCHEDULED
          }))
        }
      }
    });

    // Increment recycle count on original
    await this.prisma.post.update({
      where: { id: postId },
      data: { recycleCount: { increment: 1 } }
    });

    return newPost;
  }

  async toggleEvergreen(postId: string, status: boolean) {
    return this.prisma.post.update({
      where: { id: postId },
      data: { isEvergreen: status }
    });
  }

  private calculatePerformanceScore(post: any): number {
    let likes = 0, comments = 0, shares = 0, views = 0;
    
    post.socialAccounts.forEach(sa => {
      likes += sa.likes || 0;
      comments += sa.comments || 0;
      shares += sa.shares || 0;
      views += sa.views || 0;
    });

    const engagement = (likes * 1) + (comments * 3) + (shares * 5);
    const reach = views || (engagement > 0 ? engagement * 10 : 1);
    
    // Normalize to 0-100 (Simplified logic)
    const score = (engagement / reach) * 1000; 
    return Math.min(Math.round(score), 100);
  }
}