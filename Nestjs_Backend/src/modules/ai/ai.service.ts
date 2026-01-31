import { Injectable, Logger, InternalServerErrorException, RequestTimeoutException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';
import { PrismaService } from '../../prisma/prisma.service'; // Inject Prisma
import { v4 as uuidv4 } from 'uuid'; // Make sure to pnpm add uuid
import { PlanType } from '@prisma/client';

// Define DTOs/Enums locally or import them if you moved them to separate files
export enum MarketingFramework {
  AIDA = 'AIDA',
  PAS = 'PAS',
  STORY = 'STORY',
  DIRECT = 'DIRECT'
}

export enum AiTone {
  PROFESSIONAL = 'PROFESSIONAL',
  CASUAL = 'CASUAL',
  CAMFRANGLAIS = 'CAMFRANGLAIS',
  NOUCHI = 'NOUCHI',
  URGENT = 'URGENT'
}

export enum AiLength {
  SHORT = 'SHORT',
  MEDIUM = 'MEDIUM',
  LONG = 'LONG'
}

@Injectable()
export class AiService {
  private groq: OpenAI | null = null;
  private readonly logger = new Logger(AiService.name);

  // Approximate pricing for Llama-3-70b (adjust based on Groq's current pricing)
  // Groq often offers free beta tiers, but for future-proofing:
  private readonly PRICING = {
    input: 0.00059, // per 1k tokens
    output: 0.00079 // per 1k tokens
  };

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService // Injected for logging
  ) {
    const groqKey = this.configService.get<string>('GROQ_API_KEY') || '';

    if (groqKey) {
      this.groq = new OpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: groqKey,
      });
    } else {
      this.logger.warn('⚠️ GROQ_API_KEY missing. AI features will be mocked.');
    }
  }

  /**
   * Checks if the user has reached their AI usage limits.
   */
  private async checkUsageLimits(userId: string, workspaceId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { planType: true }
      });

      if (!user) {
        this.logger.warn(`checkUsageLimits: User ${userId} not found.`);
        return;
      }

      if (user.planType === PlanType.FREE) {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const count = await this.prisma.aiUsageLog.count({
          where: {
            userId,
            createdAt: { gte: startOfMonth }
          }
        });

        if (count >= 10) {
          throw new ForbiddenException('Monthly AI limit reached. Please upgrade to PRO for unlimited requests.');
        }
      }
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      this.logger.error('Error checking AI usage limits', e);
    }
  }

  // ======================================================
  // 👂 THE EARS (Whisper-Large-V3)
  // ======================================================
  async transcribeAudio(filePath: string): Promise<string> {
    if (!this.groq) return "Mock Transcription: Post the red shoes.";

    try {
      this.logger.log('Transcribing audio via Groq...');
      const response = await this.groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-large-v3',
        language: 'en', // 🛑 FORCED ENGLISH (Fixes Hallucinations)
        response_format: 'json',
      });
      return response.text;
    } catch (error) {
      this.handleAiError(error, 'system', 'transcription');
      return ""; // Unreachable due to throw, but satisfies Typescript
    }
  }

  // ======================================================
  // 🧠 THE STRATEGIST (Llama-3-70b via Groq)
  // ======================================================
  async parseUserIntent(transcribedText: string, userId: string, workspaceId: string): Promise<any> {
    await this.checkUsageLimits(userId, workspaceId);
    if (!this.groq) return this.mockIntent();

    const systemPrompt = `
      You are the "Core Intelligence" of EasyPost Africa.
      Current Date: ${new Date().toISOString()}
      
      YOUR GOAL: Extract structured user intent from voice commands with high precision.
      
      RULES:
      1. IGNORE filler words ("um", "ah", "like").
      2. DETECT Platforms: If user says "FB", map to "FACEBOOK". "Twitter/X" -> "TWITTER".
      3. SEARCH QUERY: Extract the visual object they are describing (e.g. "red shoes", "promo flyer").
      4. DATE PARSING: Convert "tomorrow morning" to ISO string. If unspecified, use tomorrow 9am.
      
      JSON OUTPUT FORMAT (No Markdown, just JSON):
      {
        "action": "CREATE_POST",
        "searchQuery": "string",
        "platforms": ["FACEBOOK" | "INSTAGRAM" | "WHATSAPP" | "LINKEDIN" | "TIKTOK"],
        "scheduleDate": "ISO8601 string",
        "tone": "PROFESSIONAL" | "CASUAL" | "CAMFRANGLAIS" | "NOUCHI"
      }
    `;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcribedText },
        ],
        response_format: { type: 'json_object' },
      });

      // Log Usage
      await this.logTokenUsage(
        userId, 
        workspaceId, 
        'intent-parsing', 
        'llama-3.3-70b-versatile', 
        response.usage
      );

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      this.handleAiError(error, userId, 'intent-parsing');
      return this.mockIntent();
    }
  }

  // ======================================================
  // 🤝 THE SUPPORT AGENT (Customer Service)
  // ======================================================
  async chatWithSupport(userMessage: string, userId: string, workspaceId: string): Promise<{ messageId: string, response: string }> {
    try {
      await this.checkUsageLimits(userId, workspaceId);
    } catch (e) {
      if (e instanceof ForbiddenException) return { messageId: 'limit-reached', response: e.message };
    }

    if (!this.groq) return { messageId: 'mock-id', response: "Steve AI is offline. Ensure GROQ_API_KEY is configured." };

    const messageId = uuidv4(); // Unique ID for feedback
    const systemPrompt = `
      ROLE: You are "Steve", the Senior Customer Success Manager at EasyPost Africa.
      ... (rest of your prompt) ...
    `;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
      });

      // Log Usage
      await this.logTokenUsage(
        userId, 
        workspaceId, 
        'support-chat', 
        'llama-3.3-70b-versatile', 
        response.usage
      );

      return {
        messageId: messageId,
        response: response.choices[0].message.content || "I didn't catch that."
      };
    } catch (error) {
      this.handleAiError(error, userId, 'support-chat');
      throw new InternalServerErrorException('Support AI failed'); // Unreachable
    }
  }

  // ======================================================
  // ✍️ THE EXPERT COPYWRITER (Marketing Strategist)
  // ======================================================
  async generateMarketingCopy(
    productName: string,
    visualDescription: string,
    tone: AiTone,
    userId: string,
    workspaceId: string,
    length: AiLength = AiLength.MEDIUM,
    framework: MarketingFramework = MarketingFramework.AIDA
  ): Promise<{ messageId: string, content: string }> {
    await this.checkUsageLimits(userId, workspaceId);
    if (!this.groq) return { messageId: 'mock-id', content: `Mock Caption for ${productName}` };

    const messageId = uuidv4();
    const systemPrompt = `
      ROLE: You are an Elite Digital Marketing Strategist...
      ... (rest of your prompt) ...
      TONE: ${tone}
      LENGTH: ${length}
      FRAMEWORK: ${framework}
    `;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write a caption for: ${productName}. Visuals: ${visualDescription}` },
        ],
      });

      // Log Usage
      await this.logTokenUsage(
        userId, 
        workspaceId, 
        'copywriting', 
        'llama-3.3-70b-versatile', 
        response.usage
      );

      return {
        messageId: messageId,
        content: response.choices[0].message.content || ''
      };
    } catch (error) {
      this.handleAiError(error, userId, 'copywriting');
      throw new InternalServerErrorException('AI Copywriting failed');
    }
  }

  // ======================================================
  // 🕵️ INTERNAL HELPERS (Logging & Errors)
  // ======================================================

  /**
   * Logs token usage and estimated cost to the database.
   */
  private async logTokenUsage(userId: string, workspaceId: string, action: string, model: string, usage: any) {
    if (!usage) return;

    try {
      const { prompt_tokens, completion_tokens, total_tokens } = usage;
      
      // Calculate Cost
      const cost = 
        (prompt_tokens / 1000 * this.PRICING.input) + 
        (completion_tokens / 1000 * this.PRICING.output);

      await this.prisma.aiUsageLog.create({
        data: {
          userId,
          workspaceId,
          action,
          model,
          inputTokens: prompt_tokens,
          outputTokens: completion_tokens,
          totalTokens: total_tokens,
          cost: cost,
        }
      });
      
      this.logger.log(`Logged AI usage: ${total_tokens} tokens ($${cost.toFixed(6)})`);
    } catch (e) {
      this.logger.error('Failed to log token usage', e);
      // Swallow error so we don't fail the request just because logging failed
    }
  }

  /**
   * Centralized robust error handling for AI calls.
   */
  private handleAiError(error: any, userId: string, context: string) {
    this.logger.error(`AI Error [${context}] for user ${userId}: ${error.message}`, error.stack);

    // Timeout Handling
    if (error.code === 'ETIMEDOUT' || error.type === 'request_timeout') {
      throw new RequestTimeoutException('The AI service timed out. Please try again.');
    }

    // Rate Limiting
    if (error.status === 429) {
      throw new InternalServerErrorException('AI system is currently busy. Please try again in a moment.');
    }

    // Context Length
    if (error.code === 'context_length_exceeded') {
       throw new InternalServerErrorException('The input is too long for the AI to process.');
    }

    // Generic Fallback
    throw new InternalServerErrorException('An unexpected error occurred with the AI service.');
  }

  /**
   * Submits user feedback for a specific AI response.
   */
  async submitFeedback(userId: string, dto: { messageId: string, rating: number, comment?: string }) {
    return this.prisma.aiFeedback.create({
      data: {
        userId,
        aiMessageId: dto.messageId,
        rating: dto.rating,
        feedbackText: dto.comment
      }
    });
  }

  private mockIntent() {
    return {
      action: 'CREATE_POST',
      searchQuery: 'mock',
      platforms: ['FACEBOOK'],
      scheduleDate: new Date().toISOString(),
      tone: 'PROFESSIONAL'
    };
  }
}