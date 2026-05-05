import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublisherService } from '../publishing/publisher.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private publisher: PublisherService,
  ) {}

  // ➤ 1. SCHEDULE POST
  async schedulePost(postId: string, date: Date, _timezone: string = 'UTC') {
    // a. Validate Date (Cannot be in the past)
    const now = new Date();
    if (date < now) {
      throw new Error('Cannot schedule post in the past');
    }

    // b. Prevent double scheduling
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new Error('Post not found');
    if (post.status === 'SCHEDULED' || post.status === 'PUBLISHED') {
      throw new Error('Post is already scheduled or published');
    }

    // c. Convert timezone (Simplified: Assuming date passed is already in correct target time or UTC)
    // In a real app, we'd use date-fns-tz or luxon here.

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        scheduledFor: date,
        status: 'SCHEDULED',
      },
    });
  }

  // ➤ 2. RESCHEDULE
  async reschedulePost(postId: string, newDate: Date) {
    if (newDate < new Date()) {
      throw new Error('Cannot reschedule to a past date');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: { scheduledFor: newDate },
    });
  }

  // ➤ 3. CANCEL
  async cancelScheduledPost(postId: string) {
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        status: 'DRAFT',
        scheduledFor: null,
      },
    });
  }

  // ➤ 4. LIST SCHEDULED
  async getScheduledPosts(workspaceId: string) {
    return this.prisma.post.findMany({
      where: {
        workspaceId,
        status: 'SCHEDULED',
      },
      orderBy: { scheduledFor: 'asc' },
    });
  }

  // ➤ 5. MONTHLY POST COUNT RESET — runs at 00:00 on the 1st of every month (UTC)
  @Cron('0 0 1 * *')
  async resetMonthlyPostCounts() {
    this.logger.log('Resetting monthly post counts for all workspaces...');
    const result = await this.prisma.workspace.updateMany({
      data: { currentPostCount: 0 },
    });
    this.logger.log(`Reset post counts for ${result.count} workspaces`);
  }

  // Run every 60 seconds
  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.debug('⏰ Checking for scheduled posts...');

    const now = new Date();

    // 1. Find Due Posts
    // Status must be SCHEDULED and Time must be passed
    const duePosts = await this.prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: { lte: now },
      },
      take: 10, // Process in batches of 10 to avoid memory spikes
    });

    if (duePosts.length === 0) return;

    this.logger.log(`Found ${duePosts.length} posts to publish.`);

    // 2. Process Each Post
    for (const post of duePosts) {
      // Locking Mechanism: Mark as PUBLISHING immediately so next Cron doesn't grab it
      await this.prisma.post.update({
        where: { id: post.id },
        data: { status: 'PUBLISHING' },
      });

      // Hand off to the worker
      // We don't await this because we want to process the batch quickly
      // The PublisherService handles the rest asynchronously
      this.publisher.publishPost(post.id);
    }
  }
}
