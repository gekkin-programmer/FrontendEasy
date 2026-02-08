import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SmartSchedulingService } from './smart-scheduling.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('AI Smart Scheduling')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai/smart-scheduling')
export class SmartSchedulingController {
  constructor(private readonly smartSchedulingService: SmartSchedulingService) {}

  @Get('suggestions')
  @ApiOperation({ summary: 'Get AI-powered publishing time suggestions' })
    getSuggestions(
      @Query('workspaceId') workspaceId: string,
      @Query('platform') platform: string,
    ) {
      return this.smartSchedulingService.getSuggestions(workspaceId, platform);
    }
  
    @Get('heatmap')
    @ApiOperation({ summary: 'Get a full week heatmap of predicted engagement' })
    getHeatmap(
      @Query('workspaceId') workspaceId: string,
      @Query('platform') platform: string,
    ) {
      return this.smartSchedulingService.getHeatmap(workspaceId, platform);
    }
  }
  