import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AiService, MarketingFramework } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TestAiDto } from './dto/test-ai.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

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
    @CurrentUser() user: any, // Get logged-in user
  ) {
    // We assume user object has id and currentWorkspaceId (or similar)
    // If workspaceId isn't on user, you might need a @CurrentWorkspace() decorator
    const workspaceId =
      user.workspaceId || user.ownedWorkspaces?.[0]?.id || 'default-ws';

    const userId = user.sub || user.id;

    const result = await this.aiService.generateMarketingCopy(
      dto.product,
      'A generic test image description',
      dto.tone,
      userId,
      workspaceId,
      dto.length,
      MarketingFramework.AIDA,
    );

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    return {
      ...result,
      aiUsageCount: await this.aiService.prisma.aiUsageLog.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      }),
    };
  }

  // ➤ 1.5 Enhance Text
  @Post('enhance-text')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Enhance existing text with AI' })
  async enhanceText(@Body() body: { text: string }, @CurrentUser() user: any) {
    const userId = user.sub || user.id;
    const workspaceId =
      user.workspaceId || user.ownedWorkspaces?.[0]?.id || 'default-ws';
    return this.aiService.enhanceText(body.text, userId, workspaceId);
  }

  // ➤ 2. Support Chat
  @Post('chat')
  @ApiOperation({ summary: 'Chat with EasyAI Support' })
  @ApiBody({
    schema: { type: 'object', properties: { message: { type: 'string' } } },
  })
  async chat(@Body() body: { message: string }, @CurrentUser() user?: any) {
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
    @CurrentUser() user?: any,
  ) {
    const userId = user?.sub || user?.id || 'visitor';
    await this.aiService.submitFeedback(userId, body);
    return { success: true };
  }
}
