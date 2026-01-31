import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AiService, MarketingFramework } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TestAiDto } from './dto/test-ai.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client'; // Or your specific User interface

@ApiTags('AI Engine')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Apply Guard globally for the controller (Safety First)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ➤ 1. Marketing Copy Generation
  @Post('test-copywriting')
  @ApiOperation({ summary: 'Generate marketing copy' })
  async testCopywriting(
    @Body() dto: TestAiDto,
    @CurrentUser() user: any // Get logged-in user
  ) {
    // We assume user object has id and currentWorkspaceId (or similar)
    // If workspaceId isn't on user, you might need a @CurrentWorkspace() decorator
    const workspaceId = user.workspaceId || user.ownedWorkspaces?.[0]?.id || 'default-ws';

    const result = await this.aiService.generateMarketingCopy(
      dto.product,
      "A generic test image description", // In real app, pass this from DTO
      dto.tone,
      user.id,        // <--- Pass ID
      workspaceId,    // <--- Pass Workspace ID
      dto.length,     // <--- Pass length
      MarketingFramework.AIDA
    );
    
    // Returns { messageId: "...", content: "..." }
    return result; 
  }

  // ➤ 2. Support Chat
  @Post('chat')
  @ApiOperation({ summary: 'Chat with EasyAI Support' })
  @ApiBody({ schema: { type: 'object', properties: { message: { type: 'string' } } } })
  async chat(
    @Body() body: { message: string },
    @CurrentUser() user: any
  ) {
    const workspaceId = user.workspaceId || 'default-ws';

    const result = await this.aiService.chatWithSupport(
      body.message,
      user.id,      // <--- Pass ID
      workspaceId   // <--- Pass Workspace ID
    );
    
    // Returns { messageId: "...", response: "..." }
    return result;
  }

  // ➤ 3. Feedback Endpoint (CRITICAL FOR PHASE 5)
  @Post('feedback')
  @ApiOperation({ summary: 'Rate an AI response' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        messageId: { type: 'string' }, 
        rating: { type: 'number', example: 1 }, 
        comment: { type: 'string' } 
      } 
    } 
  })
  async feedback(
    @Body() body: { messageId: string, rating: number, comment?: string },
    @CurrentUser() user: any
  ) {
    await this.aiService.submitFeedback(user.id, body);
    return { success: true };
  }
}