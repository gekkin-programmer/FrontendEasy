import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { AiService, MarketingFramework } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TestAiDto } from './dto/test-ai.dto';

@ApiTags('AI Engine')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  // ➤ 1. Marketing Copy Generation
  @Post('test-copywriting')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generate marketing copy' })
  async testCopywriting(@Body() dto: TestAiDto) {
    const generatedText = await this.aiService.generateMarketingCopy(
      dto.product,
      "A generic test image description",
      dto.tone,
      MarketingFramework.AIDA
    );
    
    return { content: generatedText };
  }

  // ➤ 2. Support Chat
  @Post('chat')
  @ApiOperation({ summary: 'Chat with EasyAI Support' })
  @ApiBody({ schema: { type: 'object', properties: { message: { type: 'string' } } } })
  async chat(@Body() body: { message: string }) {
    const reply = await this.aiService.chatWithSupport(body.message);
    return { reply };
  }
}