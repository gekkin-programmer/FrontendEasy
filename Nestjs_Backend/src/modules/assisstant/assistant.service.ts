import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AiService, AiTone } from '../ai/ai.service';
import * as fs from 'fs';
import 'multer'; // Helper import for types

@Injectable()
export class AssistantService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  // We use 'any' for file to bypass the global.Express namespace issue safely
  async processVoiceCommand(file: any, userId: string) {
    if (!file || !file.buffer) {
      throw new InternalServerErrorException('No audio file provided');
    }

    const tempPath = `./temp_${Date.now()}.mp3`;
    fs.writeFileSync(tempPath, file.buffer);

    try {
      // 1. Transcribe (Groq)
      const text = await this.aiService.transcribeAudio(tempPath);
      console.log('🗣️ User said:', text);

      // 2. Parse Intent (DeepSeek)
      const intent = await this.aiService.parseUserIntent(text);
      console.log('🧠 Intent:', intent);

      // 3. Find Image (Prisma)
      // Now that Prisma Client is generated, this .mediaLibrary access will work!
      const media = await this.prisma.mediaLibrary.findFirst({
        where: {
          uploaderId: userId,
          OR: [
            { aiDescription: { contains: intent.searchQuery, mode: 'insensitive' } },
            { filename: { contains: intent.searchQuery, mode: 'insensitive' } },
            { aiTags: { has: intent.searchQuery.toLowerCase() } }
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!media) {
        throw new NotFoundException(`No image found matching "${intent.searchQuery}"`);
      }

      // 4. Generate Caption (DeepSeek)
      const tone = (intent.tone as AiTone) || AiTone.PROFESSIONAL;
      const caption = await this.aiService.generateMarketingCopy(
        intent.searchQuery, 
        media.aiDescription || media.filename,
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
          media: {
            create: {
              media: { connect: { id: media.id } },
              order: 0
            }
          },
          platformData: { aiIntent: intent }
        },
        include: { media: { include: { media: true } } }
      });

      return {
        message: 'Command executed successfully',
        transcription: text,
        createdPost: {
          id: post.id,
          caption: post.content,
          scheduledFor: post.scheduledFor,
          image: media.url
        }
      };

    } finally {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }
}