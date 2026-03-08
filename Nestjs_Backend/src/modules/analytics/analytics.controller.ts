import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsFilterDto } from './dto/analytics-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Analytics Data (Type: OVERVIEW | ACCOUNTS | POSTS)',
  })
  getAnalytics(
    @Query('workspaceId') workspaceId: string,
    @Query() query: AnalyticsFilterDto,
  ) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    return this.analyticsService.getAnalytics(workspaceId, query);
  }

  // =================================================================
  // ➤ STRATEGIC INSIGHTS (The "Smart" Layer)
  // =================================================================

  @Get('insights/best-time')
  @ApiOperation({ summary: 'Get best posting times based on history' })
  getBestPostingTimes(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    return this.analyticsService.analyzeBestTimes(workspaceId);
  }

  @Get('insights/hashtags')
  @ApiOperation({ summary: 'Get top performing hashtags' })
  getTopHashtags(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    return this.analyticsService.analyzeHashtags(workspaceId);
  }

  @Get('insights/content-mix')
  @ApiOperation({ summary: 'Compare Image vs Video vs Text performance' })
  getContentMix(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    return this.analyticsService.analyzeContentMix(workspaceId);
  }

  // =================================================================
  // ➤ ADVANCED INVESTOR METRICS (Deep Dive)
  // =================================================================

  @Get('insights/health')
  @ApiOperation({ summary: 'Calculate Account Consistency & Health Score' })
  getAccountHealth(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    return this.analyticsService.analyzeAccountHealth(workspaceId);
  }

  @Get('insights/forecast')
  @ApiOperation({ summary: 'Predict future engagement (Linear Regression)' })
  getGrowthForecast(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    return this.analyticsService.calculateGrowthForecast(workspaceId);
  }

  @Get('insights/smart-copy')
  @ApiOperation({ summary: 'Analyze words that trigger engagement (NLP)' })
  getSmartCopyAnalysis(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    return this.analyticsService.analyzeSmartCopy(workspaceId);
  }

  @Get('insights/timeline')
  @ApiOperation({
    summary: 'Get daily publication activity for the last 30 days',
  })
  getActivityTimeline(@Query('workspaceId') workspaceId: string) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    return this.analyticsService.getActivityTimeline(workspaceId);
  }
}
