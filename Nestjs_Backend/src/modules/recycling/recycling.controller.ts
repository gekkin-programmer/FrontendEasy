import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Patch,
  Param,
} from '@nestjs/common';
import { RecyclingService } from './recycling.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Content Recycling')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('recycling')
export class RecyclingController {
  constructor(private readonly recyclingService: RecyclingService) {}

  @Get('candidates')
  @ApiOperation({ summary: 'Get top-performing posts eligible for recycling' })
  getCandidates(@Query('workspaceId') workspaceId: string) {
    return this.recyclingService.getRecyclableCandidates(workspaceId);
  }

  @Patch('posts/:id/evergreen')
  @ApiOperation({ summary: 'Toggle evergreen status of a post' })
  toggleEvergreen(@Param('id') id: string, @Body('status') status: boolean) {
    return this.recyclingService.toggleEvergreen(id, status);
  }

  @Post('posts/:id/recycle')
  @ApiOperation({
    summary: 'Create an AI-powered recycled variation of a post',
  })
  recycle(
    @Param('id') id: string,
    @Request() req,
    @Body('scheduledFor') scheduledFor: string,
  ) {
    return this.recyclingService.recyclePost(
      id,
      req.user.sub,
      new Date(scheduledFor),
    );
  }
}
