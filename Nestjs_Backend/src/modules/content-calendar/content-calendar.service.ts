import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ContentCalendarService {
  constructor(private prisma: PrismaService) {}

  async getCalendarEvents(workspaceId: string, start: string, end: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        workspaceId: workspaceId,
        scheduledFor: {
          gte: new Date(start),
          lte: new Date(end),
        },
      },
      select: {
        id: true,
        content: true,
        scheduledFor: true,
        status: true,
        socialAccounts: {
          select: {
            socialAccount: {
              select: {
                platform: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledFor: 'asc' },
    });

    //Flatten the response
    return posts.map((post) => ({
      ...post,
      socialAccounts: post.socialAccounts.map((link) => link.socialAccount),
    }));
  }
}
