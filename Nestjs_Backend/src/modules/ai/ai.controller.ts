import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AiService, MarketingFramework } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TestAiDto } from './dto/test-ai.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  id?: string;
  workspaceId?: string;
  ownedWorkspaces?: { id: string }[];
}

@ApiTags('AI Engine')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ➤ 1. Marketing Copy Generation
  @Post('test-copywriting')
  @UseGuards(JwtAuthGuard) // Keep this protected
  @ApiOperation({ summary: 'Generate marketing copy' })
  async testCopywriting(
    @Body() dto: TestAiDto,
    @CurrentUser() user: JwtPayload, // Get logged-in user
  ) {
    // We assume user object has id and currentWorkspaceId (or similar)
    // If workspaceId isn't on user, you might need a @CurrentWorkspace() decorator
    const workspaceId =
      user.workspaceId || user.ownedWorkspaces?.[0]?.id || 'default-ws';

    const userId = user.sub || user.id || '';

    const result = await this.aiService.generateMarketingCopy(
      dto.product,
      'A generic test image description', // In real app, pass this from DTO
      dto.tone,
      userId, // <--- Pass ID
      workspaceId, // <--- Pass Workspace ID
      dto.length, // <--- Pass length
      MarketingFramework.AIDA,
    );

    // Get current usage count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    // Use prisma directly here or add a method to AiService
    // Since prisma isn't exported, we assume it's better to add a helper if needed,
    // but for now, we'll assume AiService can return the count if modified.

    return {
      ...result,
      aiUsageCount: await this.aiService.prisma.aiUsageLog.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      }),
    };
  }

  // ➤ 2. Support Chat
  @Post('chat')
  @ApiOperation({ summary: 'Chat with EasyAI Support' })
  @ApiBody({
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  async chat(
    @Body() body: { message: string },
    @CurrentUser() user?: JwtPayload,
  ) {
    const userId = user?.sub || user?.id || 'visitor';
    const workspaceId =
      user?.workspaceId || user?.ownedWorkspaces?.[0]?.id || 'guest-workspace';

    const result = await this.aiService.chatWithSupport(
      body.message,
      userId,
      workspaceId,
    );

    return result;
  }

  // ➤ 3. Feedback Endpoint
  @Post('feedback')
  @ApiOperation({ summary: 'Rate an AI response' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        messageId: { type: 'string' },
        rating: { type: 'number', example: 1 },
        comment: { type: 'string' },
      },
    },
  })
  async feedback(
    @Body() body: { messageId: string; rating: number; comment?: string },
    @CurrentUser() user?: JwtPayload,
  ) {
    const userId = user?.sub || user?.id || 'visitor';
    await this.aiService.submitFeedback(userId, body);
    return { success: true };
  }
}
