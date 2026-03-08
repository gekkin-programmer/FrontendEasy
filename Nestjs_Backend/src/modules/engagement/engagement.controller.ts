import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Engagement')
@ApiBearerAuth()
@Controller('engagement')
@UseGuards(JwtAuthGuard)
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all messages for a workspace' })
  getAllMessages(@Query('workspaceId') workspaceId: string) {
    return this.engagementService.findAll(workspaceId);
  }

  @Post(':id/reply')
  @ApiOperation({ summary: 'Reply to a message' })
  replyToMessage(
    @Param('id') id: string,
    @Body('text') text: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.engagementService.reply(id, text, workspaceId);
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Update a message status' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.engagementService.updateStatus(id, status);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync messages from social platforms' })
  sync(@Query('workspaceId') workspaceId: string) {
    return this.engagementService.sync(workspaceId);
  }
}
