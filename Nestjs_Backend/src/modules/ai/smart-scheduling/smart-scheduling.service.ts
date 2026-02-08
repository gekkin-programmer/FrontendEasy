import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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
    this.mlServiceUrl = this.configService.get<string>('ML_SERVICE_URL') || 'http://localhost:8000';
  }

  async getSuggestions(workspaceId: string, platform: string) {
    // 1. Fetch historical post data (90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const historicalPosts = await this.prisma.postSocialAccount.findMany({
      where: {
        post: { workspaceId },
        socialAccount: { platform: platform as any },
        status: 'PUBLISHED',
        publishedAt: { gte: ninetyDaysAgo }
      },
      include: {
        post: {
          select: { content: true }
        }
      }
    });

    // 2. Format for ML service
    const historicalData = historicalPosts
      .filter(p => p.publishedAt)
      .map(p => ({
        publish_time: p.publishedAt!.toISOString(),
        platform: platform,
        engagement: (p.likes || 0) + (p.comments || 0) + (p.shares || 0),
        media_type: 'IMAGE' // Default or extracted from content
      }));

    // 3. Call Python ML Service
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.mlServiceUrl}/predict`, {
          workspace_id: workspaceId,
          platform: platform,
          historical_data: historicalData
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`ML Service Error: ${error.message}`);
      // Fallback suggestions if Python service is down
      return {
        suggestions: [
          { hour: 9, score: 0.5, confidence: 'low' },
          { hour: 13, score: 0.5, confidence: 'low' },
          { hour: 18, score: 0.5, confidence: 'low' }
        ],
        error: "ML_SERVICE_OFFLINE"
      };
    }
  }
}