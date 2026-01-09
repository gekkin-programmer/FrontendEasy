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
        language: 'en', // 🛑 FORCED ENGLISH (Fixes Hallucinations)
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

      const content = response.choices[0].message.content || '{}';
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Groq Intent Error', error);
      return this.mockIntent();
    }
  }

  // ======================================================
  // 🤝 THE SUPPORT AGENT (Customer Service)
  // ======================================================
  async chatWithSupport(userMessage: string): Promise<string> {
    if (!this.groq) return "Support AI is offline. Contact support@easypost.cm";

    const systemPrompt = `
      ROLE: You are "Steve", the Senior Customer Success Manager at EasyPost Africa.
      
      MISSION: Solve user problems instantly with brevity and clarity.
      
      KNOWLEDGE BASE:
      - **Product:** Social Media Scheduler & Automation for African SMBs.
      - **Integrations:** Facebook, LinkedIn, TikTok, Instagram, YouTube, X (Twitter).
      - **Payments:** Orange Money, MTN MoMo, Stripe.
      - **AI Features:** Voice-to-Post, Camfranglais/Nouchi content generation.
      - **Pricing:** 
        * Free: 1 Workspace, 2 Accounts.
        * Pro ($29): 10 Accounts, Unlimited AI.
        * Agency ($149): White-label reports.
      
      BEHAVIOR GUIDELINES:
      1. **BILINGUAL:** Reply in the exact language the user used (English/French).
      2. **CONCISE:** Max 3 sentences. Get to the point.
      3. **ACTION-ORIENTED:** Don't just explain; tell them where to click. (e.g. "Go to Settings > Connections").
      4. **HONEST:** If you don't know, say "I'll connect you with a human agent."
      
      TONE: Helpful, Professional, African Tech Savvy.
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

      return response.choices[0].message.content || "I didn't catch that.";
    } catch (error) {
      this.logger.error('Support Chat Error', error);
      throw new InternalServerErrorException('Support AI failed');
    }
  }

  // ======================================================
  // ✍️ THE EXPERT COPYWRITER (Marketing Strategist)
  // ======================================================
  async generateMarketingCopy(
    productName: string,
    visualDescription: string,
    tone: AiTone,
    framework: MarketingFramework = MarketingFramework.AIDA
  ): Promise<string> {
    if (!this.groq) return `Mock Caption for ${productName}`;

    const systemPrompt = `
      ROLE: You are an Elite Digital Marketing Strategist with deep expertise in the African Consumer Market (Lagos, Nairobi, Douala, Abidjan).
      
      OBJECTIVE: Write a high-converting social media caption that stops the scroll.
      
      STRATEGY FRAMEWORK: ${framework}
      - AIDA: Attention -> Interest -> Desire -> Action.
      - PAS: Pain -> Agitation -> Solution.
      
      INPUT CONTEXT:
      - Product: "${productName}"
      - Visuals: "${visualDescription}"
      
      TONE INSTRUCTIONS (${tone}):
      - CAMFRANGLAIS: Use authentic Cameroon urban slang (e.g. "Le ndem", "Gars", "Wanda").
      - NOUCHI: Use authentic Ivorian slang (e.g. "Enjailler", "Moula").
      - PROFESSIONAL: Corporate, clean, trustworthy.
      
      FORMAT:
      - Hook (First line must be punchy).
      - Body (Value proposition).
      - CTA (Clear instruction).
      - Hashtags (3-5 relevant tags, mixed global/local).
    `;

    try {
      const response = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile', 
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Write a caption for: ${productName}` },
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