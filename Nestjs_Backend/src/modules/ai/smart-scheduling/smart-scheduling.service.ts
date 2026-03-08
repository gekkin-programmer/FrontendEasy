import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SmartSchedulingService {
  private readonly logger = new Logger(SmartSchedulingService.name);
  private readonly mlServiceUrl: string;

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {
    this.mlServiceUrl =
      this.configService.get<string>('ML_SERVICE_URL') ||
      'http://localhost:8000';
  }

  async getSuggestions(workspaceId: string, platform: string) {
    return this.fetchFromMlService(workspaceId, platform, false);
  }

  async getHeatmap(workspaceId: string, platform: string) {
    return this.fetchFromMlService(workspaceId, platform, true);
  }

  private async fetchFromMlService(
    workspaceId: string,
    platform: string,
    fullWeek: boolean,
  ) {
    // 1. Fetch historical post data (90 days)

    const ninetyDaysAgo = new Date();

    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const historicalPosts = await this.prisma.postSocialAccount.findMany({
      where: {
        post: { workspaceId },

        socialAccount: { platform: platform as any },

        status: 'PUBLISHED',

        publishedAt: { gte: ninetyDaysAgo },
      },
    });

    // 2. Format for ML service

    const historicalData = historicalPosts

      .filter((p) => p.publishedAt)

      .map((p) => ({
        publish_time: p.publishedAt!.toISOString(),

        platform: platform,

        engagement: (p.likes || 0) + (p.comments || 0) + (p.shares || 0),

        media_type: 'IMAGE',
      }));

    // 3. Call Python ML Service

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/predict`, {
          workspace_id: workspaceId,

          platform: platform,

          historical_data: historicalData,

          full_week: fullWeek,
        }),
      );

      return response.data;
    } catch (error) {
      this.logger.error(`ML Service Error: ${error.message}`);

      return {
        suggestions: [
          { hour: 9, score: 0.5, confidence: 'low' },

          { hour: 13, score: 0.5, confidence: 'low' },

          { hour: 19, score: 0.5, confidence: 'low' },
        ],

        heatmap: [],

        error: 'ML_SERVICE_OFFLINE',
      };
    }
  }
}
