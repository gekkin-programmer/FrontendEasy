import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../modules/providers/cloudinary.service'; 

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  //Query Workspace directly instead of User relations
  async findAll(userId: string) {
    try {
      // Find the first workspace owned by this user
      // (If you have a 'members' relation, you can add an OR clause here later)
      const workspace = await this.prisma.workspace.findFirst({
        where: {
          ownerId: userId
        }
      });

      if (!workspace) {
        // If they don't own one, return empty array or handle error
        return []; 
      }

      // Fetch media for that workspace
      return this.prisma.mediaLibrary.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Could not fetch media');
    }
  }

  // same logic to upload
  async processUpload(file: any, userId: string) {
    try {
      const cloudResult = await this.cloudinary.uploadFile(file);
      
      // Find Workspace by Owner ID
      const workspace = await this.prisma.workspace.findFirst({
        where: { ownerId: userId }
      });

      if (!workspace) {
        throw new NotFoundException('No workspace found for this user');
      }

      const media = await this.prisma.mediaLibrary.create({
        data: {
          uploaderId: userId,
          workspaceId: workspace.id,
          url: cloudResult.secure_url,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          aiTags: [], 
          aiDescription: 'Uploaded via API',
        }
      });

      return { message: 'File uploaded', media };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Upload failed');
    }
  }
}