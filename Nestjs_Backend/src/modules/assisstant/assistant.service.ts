import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService, AiTone } from '../ai/ai.service';
import { MediaLibrary } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import 'multer';

@Injectable()
export class AssistantService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async processVoiceCommand(file: any, userId: string) {
    if (!file || !file.buffer) {
      throw new InternalServerErrorException('No audio file provided');
    }

    // Use OS temp dir for cross-platform safety
    const tempPath = path.join(os.tmpdir(), `voice_${Date.now()}.webm`);
    fs.writeFileSync(tempPath, file.buffer);

    try {
      // 1. Transcribe (Groq)
      const text = await this.aiService.transcribeAudio(tempPath);
      console.log('🗣️ User said:', text);

      // 2. Parse Intent (DeepSeek/Llama)
      const intent = await this.aiService.parseUserIntent(text);
      console.log('🧠 Intent:', intent);

      // 🛑 GUARD: If AI didn't understand, return early without crashing
      if (!intent || (!intent.action && !intent.searchQuery)) {
        return {
          message: "I heard you, but didn't catch a clear command. Try 'Post the red shoes'.",
          transcription: text,
          intent: null
        };
      }

      // If it's just a general question or filter request (handled by frontend)
      if (!intent.action || intent.action === 'FILTER' || intent.action === 'SEARCH') {
         return {
            message: "Command processed",
            transcription: text,
            intent: intent // Pass back to frontend to handle filters
         };
      }

      // 3. Find Image (Prisma)
      // Only search if we have a query string
      const query = intent.searchQuery || "";
      
      let media: MediaLibrary | null = null; 
      if (query) {
        media = await this.prisma.mediaLibrary.findFirst({
          where: {
            uploaderId: userId,
            OR: [
              { aiDescription: { contains: query, mode: 'insensitive' } },
              { filename: { contains: query, mode: 'insensitive' } },
              { aiTags: { has: query.toLowerCase() } }
            ],
          },
          orderBy: { createdAt: 'desc' },
        });
      }

      // If action is CREATE_POST but no image found
      if (intent.action === 'CREATE_POST' && !media) {
         // Create a text-only post or return error
         // For now, let's allow text-only
         // return { message: "I couldn't find that image, but I can draft a text post.", ... }
         throw new NotFoundException(`I couldn't find any image matching "${query}".`);
      }

      // 4. Generate Caption
      const tone = (intent.tone as AiTone) || AiTone.PROFESSIONAL;
      const caption = await this.aiService.generateMarketingCopy(
        intent.searchQuery || "New Update", 
        media ? (media.aiDescription || media.filename) : "Text Post",
        tone
      );

      // 5. Schedule Post
      const user = await this.prisma.user.findUnique({ 
        where: { id: userId }, 
        include: { ownedWorkspaces: true } 
      });

      if (!user || !user.ownedWorkspaces.length) {
        throw new InternalServerErrorException('User has no workspace');
      }

      const workspaceId = user.ownedWorkspaces[0].id;
      const scheduleDate = intent.scheduleDate ? new Date(intent.scheduleDate) : new Date(Date.now() + 86400000);

      const post = await this.prisma.post.create({
        data: {
          workspaceId: workspaceId,
          createdById: userId,
          content: caption,
          status: 'SCHEDULED',
          scheduledFor: scheduleDate,
          media: media ? {
            create: {
              media: { connect: { id: media.id } },
              order: 0
            }
          } : undefined,
          platformData: { aiIntent: intent }
        },
        include: { media: { include: { media: true } } }
      });

      return {
        message: 'Post scheduled successfully! 🚀',
        transcription: text,
        createdPost: {
          id: post.id,
          caption: post.content,
          scheduledFor: post.scheduledFor,
          image: media?.url,
          platformData: { aiIntent: intent } // Pass intent back so frontend can update UI
        }
      };

    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }
}