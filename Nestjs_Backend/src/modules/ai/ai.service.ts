import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';

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

@Injectable()
export class AiService {
  private groq: OpenAI | null = null;     
  private readonly logger = new Logger(AiService.name);

  constructor(private configService: ConfigService) {
    // Configure Groq (Serves BOTH Voice and Logic now)
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
        language: 'fr', 
        response_format: 'json',
      });
      return response.text;
    } catch (error) {
      this.logger.error('Groq Whisper Error', error);
      throw new InternalServerErrorException('Voice transcription failed');
    }
  }

  // ======================================================
  // 🧠 THE STRATEGIST (Llama-3-70b via Groq)
  // ======================================================
  async parseUserIntent(transcribedText: string): Promise<any> {
    // 🛑 Switch to Groq
    if (!this.groq) return this.mockIntent();

    const systemPrompt = `
      You are an AI Assistant for "EasyPost Africa".
      Current Date: ${new Date().toISOString()}
      
      Task: Extract structured intent from the user's voice command.
      
      JSON OUTPUT FORMAT:
      {
        "action": "CREATE_POST",
        "searchQuery": "string (keywords to find image in library)",
        "platforms": ["FACEBOOK" | "INSTAGRAM" | "WHATSAPP" | "LINKEDIN"],
        "scheduleDate": "ISO8601 string (calculate future date based on context like 'tomorrow')",
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

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Groq Intent Error', error);
      return this.mockIntent();
    }
  }

  // ======================================================
  // ✍️ THE EXPERT COPYWRITER (Llama-3-70b via Groq)
  // ======================================================
  async generateMarketingCopy(
    productName: string,
    visualDescription: string,
    tone: AiTone,
    framework: MarketingFramework = MarketingFramework.AIDA
  ): Promise<string> {
    // 🛑 Switch to Groq
    if (!this.groq) return `Mock Caption for ${productName}`;

    const systemPrompt = `
      You are an Elite Digital Marketing Strategist with 15 years of experience in the African Market.
      FRAMEWORK: ${framework}
    `;

    const userPrompt = `
      Write a social media caption.
      PRODUCT: ${productName}
      VISUAL CONTEXT: ${visualDescription}.
      TONE: ${tone}
      
      INSTRUCTIONS:
      - If tone is CAMFRANGLAIS, use authentic Cameroon slang (Ndem, Gars, Mboa).
      - Include emojis and hashtags.
    `;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', 
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      return response.choices[0].message.content || ''; 
    } catch (error) {
      this.logger.error('Groq Copywriting Error', error);
      throw new InternalServerErrorException('AI Copywriting failed');
    }
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