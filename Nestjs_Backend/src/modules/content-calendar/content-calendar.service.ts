import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentCalendarService {
  constructor(private prisma: PrismaService) {}

  async getCalendarEvents(workspaceId: string, start: string, end: string) {
    // 1. Fetch posts in range
    const posts = await this.prisma.post.findMany({
      where: {
        workspaceId,
        scheduledFor: {
          gte: new Date(start), // Greater than or equal to Start
          lte: new Date(end),   // Less than or equal to End
        },
      },
      select: {
        id: true,
        content: true,
        scheduledFor: true,
        status: true,
        socialAccounts: {
          select: { socialAccount: { select: { platform: true } } }
        }
      }
    });

    // 2. Format for Frontend (FullCalendar / React Big Calendar format)
    return posts.map(post => ({
      id: post.id,
      title: post.content.substring(0, 30) + '...', // Short title
      start: post.scheduledFor,
      // end: post.scheduledFor (For posts, start = end usually)
      extendedProps: {
        status: post.status,
        platforms: post.socialAccounts.map(sa => sa.socialAccount.platform)
      }
    }));
  }
}