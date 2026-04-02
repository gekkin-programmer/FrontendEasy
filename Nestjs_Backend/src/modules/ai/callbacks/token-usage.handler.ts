import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { LLMResult } from '@langchain/core/outputs';
import { Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// Updated Pricing (Approximate per 1k tokens)
// Source: Groq pricing (cheaper than OpenAI)
const PRICING = {
  // OpenAI
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },

  // Groq / Llama 3 (Adjust these values as Groq pricing evolves)
  'llama-3': { input: 0.00005, output: 0.0001 }, // Very cheap!
  llama3: { input: 0.00005, output: 0.0001 },
  mixtral: { input: 0.00027, output: 0.00027 },

  // Default Fallback
  default: { input: 0.0001, output: 0.0002 },
};

export class TokenUsageHandler extends BaseCallbackHandler {
  name = 'TokenUsageHandler';
  private logger = new Logger(TokenUsageHandler.name);

  constructor(
    private prisma: PrismaService,
    private userId: string,
    private workspaceId: string,
    private action: string,
  ) {
    super();
  }

  async handleLLMEnd(
    output: LLMResult,
    _runId: string,
    _parentRunId?: string,
    _tags?: string[],
  ) {
    try {
      const tokenUsage = output.llmOutput?.tokenUsage;
      // Normalization: Groq might return 'llama-3.3-70b-versatile', we just want to match 'llama' keys
      const rawModelName = output.llmOutput?.modelName || 'unknown';

      if (tokenUsage) {
        const { totalTokens, promptTokens, completionTokens } = tokenUsage;

        // Find pricing: Check exact match -> Check partial match (e.g. "llama") -> Default
        let price = PRICING['default'];

        if (PRICING[rawModelName]) {
          price = PRICING[rawModelName];
        } else {
          // Fuzzy match (e.g. if model is "llama-3.3-70b", find "llama-3")
          const key = Object.keys(PRICING).find((k) =>
            rawModelName.includes(k),
          );
          if (key) price = PRICING[key];
        }

        const estimatedCost =
          (promptTokens / 1000) * price.input +
          (completionTokens / 1000) * price.output;

        await this.prisma.aiUsageLog.create({
          data: {
            userId: this.userId,
            workspaceId: this.workspaceId,
            action: this.action,
            model: rawModelName,
            inputTokens: promptTokens || 0,
            outputTokens: completionTokens || 0,
            totalTokens: totalTokens || 0,
            cost: estimatedCost,
          },
        });

        this.logger.log(
          `Logged AI usage: ${totalTokens} tokens ($${estimatedCost.toFixed(6)})`,
        );
      }
    } catch (error) {
      this.logger.error('Failed to log token usage', error);
      // We explicitly catch this so it doesn't fail the user's request
      // just because logging failed.
    }
  }
}
