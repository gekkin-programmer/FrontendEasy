import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator';

@Controller('engagement')
@UseGuards(JwtAuthGuard)
export class EngagementController {
  constructor(private readonly engagementService: EngagementService) {}

  @Get()
  getAllMessages(@CurrentWorkspace() workspaceId: string) {
    return this.engagementService.findAll(workspaceId);
  }

  @Post(':id/reply')
  replyToMessage(
    @Param('id') id: string,
    @Body('text') text: string,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.engagementService.reply(id, text, workspaceId);
  }

  @Post(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.engagementService.updateStatus(id, status);
  }
}
