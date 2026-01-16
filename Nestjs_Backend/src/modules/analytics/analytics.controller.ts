import { Controller, Get, Query, Req, UseGuards, BadRequestException } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Get Analytics Data (Type: OVERVIEW | ACCOUNTS | POSTS)' })
  getAnalytics(
    @Query('workspaceId') workspaceId: string, 
    @Query() query: AnalyticsFilterDto
  ) {
    if (!workspaceId) throw new BadRequestException('Workspace ID is required');
    return this.analyticsService.getAnalytics(workspaceId, query);
  }
}