import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService, AiTone } from '../ai/ai.service';
import { MediaLibrary } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
// import 'multer'; // Not needed at runtime, types come from @types/multer

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

    // 0. Get Workspace ID early (Needed for AI logging)
    const user = await this.prisma.user.findUnique({ 
      where: { id: userId }, 
      include: { ownedWorkspaces: true } 
    });

    if (!user || !user.ownedWorkspaces.length) {
      throw new InternalServerErrorException('User has no workspace');
    }
    const workspaceId = user.ownedWorkspaces[0].id; // Default to first workspace

    // Use OS temp dir for cross-platform safety
    const tempPath = path.join(os.tmpdir(), `voice_${Date.now()}.webm`);
    fs.writeFileSync(tempPath, file.buffer);

    try {
      // 1. Transcribe (Groq)
      const text = await this.aiService.transcribeAudio(tempPath);
      console.log('🗣️ User said:', text);

      // 2. Parse Intent (DeepSeek/Llama)
      // ➤ FIX: Pass userId and workspaceId
      const intent = await this.aiService.parseUserIntent(text, userId, workspaceId);
      console.log('🧠 Intent:', intent);

      // 🛑 GUARD: If AI didn't understand
      if (!intent || (!intent.action && !intent.searchQuery)) {
        return {
          message: "I heard you, but didn't catch a clear command. Try 'Post the red shoes'.",
          transcription: text,
          intent: null
        };
      }

      // If it's just a general question or filter request
      if (!intent.action || intent.action === 'FILTER' || intent.action === 'SEARCH') {
         return {
            message: "Command processed",
            transcription: text,
            intent: intent 
         };
      }

      // 3. Find Image (Prisma)
      const query = intent.searchQuery || "";
      let media: MediaLibrary | null = null; 

      if (query) {
        media = await this.prisma.mediaLibrary.findFirst({
          where: {
            workspaceId: workspaceId, // Scope to workspace
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
      if (intent.action === 'CREATE_POST' && !media && query) {
         throw new NotFoundException(`I couldn't find any image matching "${query}".`);
      }

      // 4. Generate Caption
      const tone = (intent.tone as AiTone) || AiTone.PROFESSIONAL;
      // ➤ FIX: Pass userId and workspaceId, expecting object return
      const copyResult = await this.aiService.generateMarketingCopy(
        intent.searchQuery || "New Update", 
        media ? (media.aiDescription || media.filename) : "Text Post",
        tone,
        userId,
        workspaceId
      );
      const caption = copyResult.content; 

      // 5. Schedule Post
      const scheduleDate = intent.scheduleDate ? new Date(intent.scheduleDate) : new Date(Date.now() + 86400000);

      const post = await this.prisma.post.create({
        data: {
          workspaceId: workspaceId,
          createdById: userId,
          content: caption,
          status: 'SCHEDULED',
          scheduledFor: scheduleDate,
          // ➤ FIX: Correct relation syntax for PostMedia join table
          media: media ? {
            create: {
              mediaId: media.id,
              order: 0
            }
          } : undefined,
          // ➤ REMOVED: platformData (doesn't exist in schema anymore)
        },
        include: { media: { include: { media: true } } }
      });

      // 6. Get Current Usage for Frontend
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const aiUsageCount = await this.prisma.aiUsageLog.count({
        where: {
          userId,
          createdAt: { gte: startOfMonth }
        }
      });

      return {
        message: 'Post scheduled successfully! ',
        transcription: text,
        aiUsageCount,
        createdPost: {
          id: post.id,
          caption: post.content,
          scheduledFor: post.scheduledFor,
          image: media?.url,
          intent: intent 
        }
      };

    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }
}