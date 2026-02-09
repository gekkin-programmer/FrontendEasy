import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublisherService } from '../publishing/publisher.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private publisher: PublisherService
  ) {}

  // ➤ 1. SCHEDULE POST
  async schedulePost(postId: string, date: Date, timezone: string = 'UTC') {
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
        status: 'SCHEDULED'
      }
    });
  }

  // ➤ 2. RESCHEDULE
  async reschedulePost(postId: string, newDate: Date) {
    if (newDate < new Date()) {
      throw new Error('Cannot reschedule to a past date');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: { scheduledFor: newDate }
    });
  }

  // ➤ 3. CANCEL
  async cancelScheduledPost(postId: string) {
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        status: 'DRAFT',
        scheduledFor: null
      }
    });
  }

  // ➤ 4. LIST SCHEDULED
  async getScheduledPosts(workspaceId: string) {
    return this.prisma.post.findMany({
      where: {
        workspaceId,
        status: 'SCHEDULED'
      },
      orderBy: { scheduledFor: 'asc' }
    });
  }

  // Run every 60 seconds
    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleCron() {
      this.logger.debug('Running scheduled posts check...');
      await this.processDuePosts();
    }
  
    // Find all posts where scheduledFor <= now AND status = SCHEDULED
    private async processDuePosts() {
      const now = new Date();
      const duePosts = await this.prisma.post.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledFor: { lte: now }
        },
        include: {
          socialAccounts: {
            include: { socialAccount: true }
          }
        }
      });
  
      if (duePosts.length === 0) return;
  
      this.logger.log(`Found ${duePosts.length} posts due for publication`);
  
          for (const post of duePosts) {
  
            try {
  
              await this.publisher.publishPost(post.id);
  
              this.logger.log(`Successfully published due post: ${post.id}`);
  
            } catch (e) {
  
      
          this.logger.error(`Failed to publish due post ${post.id}: ${e.message}`);
        }
      }
    }
  }
  