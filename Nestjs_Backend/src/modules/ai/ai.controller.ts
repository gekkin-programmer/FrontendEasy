import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService, MarketingFramework } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TestAiDto } from './dto/test-ai.dto';

@ApiTags('AI Engine (Test)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('test-copywriting')
  @ApiOperation({ summary: 'Test DeepSeek V3 logic' })
  async testCopywriting(@Body() dto: TestAiDto) {
    return this.aiService.generateMarketingCopy(
      dto.product,
      "A generic test image description",
      dto.tone,
      MarketingFramework.AIDA
    );
  }
}