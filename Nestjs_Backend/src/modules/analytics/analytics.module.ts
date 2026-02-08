import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SmartSchedulingModule } from '../ai/smart-scheduling/smart-scheduling.module';

@Module({
  imports: [PrismaModule, SmartSchedulingModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}