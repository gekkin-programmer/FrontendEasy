import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Patch,
  Param,
} from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedbackStatus } from '@prisma/client';

@ApiTags('Community')
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('roadmap')
  @ApiOperation({ summary: 'Get community roadmap' })
  getRoadmap() {
    return this.communityService.getRoadmap();
  }

  @Get('contributors')
  @ApiOperation({ summary: 'Get top contributors' })
  getTopContributors() {
    return this.communityService.getTopContributors();
  }

  @Post('feedback')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submit new feedback' })
  createFeedback(@CurrentUser() user: any, @Body() dto: CreateFeedbackDto) {
    return this.communityService.createFeedback(user.sub || user.id, dto);
  }

  @Post('feedback/:id/upvote')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Toggle upvote on feedback' })
  toggleUpvote(@CurrentUser() user: any, @Param('id') id: string) {
    return this.communityService.toggleUpvote(user.sub || user.id, id);
  }

  // --- ADMIN ---
  @Patch('feedback/:id/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update feedback status (Admin)' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: FeedbackStatus,
  ) {
    return this.communityService.updateStatus(id, status);
  }
}
