import { Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { AudienceService } from './audience.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Audience Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audience')
export class AudienceController {
  constructor(private readonly audienceService: AudienceService) {}

  @Get('top-fans')
  @ApiOperation({ summary: 'Get top engaged followers' })
  getTopFans(@Query('workspaceId') workspaceId: string) {
    return this.audienceService.getTopFans(workspaceId);
  }

  @Get('segmentation')
  @ApiOperation({ summary: 'Get audience segment distribution' })
  getSegmentation(@Query('workspaceId') workspaceId: string) {
    return this.audienceService.getSegmentationStats(workspaceId);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync interactions from social platforms' })
  sync(@Query('workspaceId') workspaceId: string) {
    return this.audienceService.syncAudience(workspaceId);
  }
}