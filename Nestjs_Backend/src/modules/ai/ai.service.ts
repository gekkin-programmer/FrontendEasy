import { Injectable, Logger, InternalServerErrorException, RequestTimeoutException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import OpenAI from 'openai';
import * as fs from 'fs';
import { PrismaService } from '../../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { PlanType } from '@prisma/client';

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
  private genAI: GoogleGenerativeAI | null = null;
  private model: GenerativeModel | null = null;
  private groq: OpenAI | null = null;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private configService: ConfigService,
    public prisma: PrismaService
  ) {
    const geminiKey = this.configService.get<string>('GOOGLE_API_KEY') || '';
    const groqKey = this.configService.get<string>('GROQ_API_KEY') || '';

    if (geminiKey) {
      this.genAI = new GoogleGenerativeAI(geminiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    if (groqKey) {
      this.groq = new OpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: groqKey,
      });
    }
  }

  /**
   * 👂 THE EARS (Whisper-Large-V3 via Groq)
   */
  async transcribeAudio(filePath: string): Promise<string> {
    if (!this.groq) return "Steve: Transcription offline.";
    try {
      const response = await this.groq.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: 'whisper-large-v3',
        language: 'en',
        response_format: 'json',
      });
      return response.text;
    } catch (error) {
      this.logger.error('Groq Transcription Error', error);
      return "";
    }
  }

  private async checkUsageLimits(userId: string, workspaceId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true }
    });

    if (user?.planType === PlanType.FREE) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const count = await this.prisma.aiUsageLog.count({
        where: { userId, createdAt: { gte: startOfMonth } }
      });

      if (count >= 10) {
        throw new ForbiddenException('🎉 Passez à STARTER pour débloquer plus de générations AI !');
      }
    }
  }

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
    if (!this.model) return { messageId: 'mock', content: 'Gemini not configured.' };

    const prompt = `
      Role: Elite Social Media Copywriter for the African market.
      Task: Create high-converting copy using the ${framework} framework.
      Product: ${productName}
      Visuals: ${visualDescription}
      Tone: ${tone}
      Length: ${length}
      Slang: If tone is NOUCHI or CAMFRANGLAIS, use local Ivorian/Cameroonian slang naturally.
      Include 3-5 hashtags and relevant emojis.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const content = result.response.text();
      const messageId = uuidv4();

      await this.logTokenUsage(userId, workspaceId, 'copywriting', 'gemini-1.5-flash', 0); // Gemini SDK doesn't expose usage easily yet in the same way

      return { messageId, content };
    } catch (error) {
      this.handleAiError(error, userId, 'copywriting');
      throw error;
    }
  }

  async enhanceText(text: string, userId: string, workspaceId: string): Promise<{ content: string }> {
    await this.checkUsageLimits(userId, workspaceId);
    if (!this.model) return { content: text };

    const prompt = `
      Task: Enhance the following social media post text.
      Optimization Goals:
      1. Fix grammar and spacing.
      2. Use bullet points for readability if appropriate.
      3. Organize into clear paragraphs.
      4. Make the tone more engaging while preserving the original meaning.
      5. Ensure proper line breaks for mobile viewing.

      Original Text:
      "${text}"

      Return ONLY the enhanced text.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const enhanced = result.response.text();
      await this.logTokenUsage(userId, workspaceId, 'enhance-text', 'gemini-1.5-flash', 0);
      return { content: enhanced };
    } catch (error) {
      this.handleAiError(error, userId, 'enhance-text');
      throw error;
    }
  }

  async parseUserIntent(transcribedText: string, userId: string, workspaceId: string): Promise<any> {
    await this.checkUsageLimits(userId, workspaceId);
    if (!this.model) return this.mockIntent();

    const prompt = `
      Extract intent from this voice command: "${transcribedText}"
      Output JSON only:
      {
        "action": "CREATE_POST",
        "searchQuery": "description of visuals",
        "platforms": ["FACEBOOK", "INSTAGRAM", "WHATSAPP", "LINKEDIN", "TIKTOK"],
        "scheduleDate": "ISO string",
        "tone": "PROFESSIONAL" | "CASUAL" | "CAMFRANGLAIS" | "NOUCHI"
      }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      const cleanedJson = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedJson);
    } catch (error) {
      this.logger.error('Gemini Intent Parsing Error', error);
      return this.mockIntent();
    }
  }

  async chatWithSupport(userMessage: string, userId: string, workspaceId: string): Promise<{ messageId: string, response: string }> {
    await this.checkUsageLimits(userId, workspaceId);
    if (!this.model) return { messageId: 'mock', response: 'Steve AI is sleeping.' };

    const prompt = `
      You are Steve, Senior Support at EasyPost. 
      Context: We help African creators manage social media. 
      User Query: "${userMessage}"
      Be helpful, bold, and energetic.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return { messageId: uuidv4(), response: result.response.text() };
    } catch (error) {
      this.handleAiError(error, userId, 'support-chat');
      throw error;
    }
  }

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

  private async logTokenUsage(userId: string, workspaceId: string, action: string, model: string, totalTokens: number) {
    try {
      await this.prisma.aiUsageLog.create({
        data: { userId, workspaceId, action, model, inputTokens: 0, outputTokens: 0, totalTokens: totalTokens || 0 }
      });
    } catch (e) { this.logger.error('Log usage failed', e); }
  }

  private handleAiError(error: any, userId: string, context: string) {
    this.logger.error(`AI Error [${context}]: ${error.message}`);
    throw new InternalServerErrorException('AI Service error');
  }

  private mockIntent() {
    return { action: 'CREATE_POST', searchQuery: 'mock', platforms: ['FACEBOOK'], scheduleDate: new Date().toISOString(), tone: 'PROFESSIONAL' };
  }
}