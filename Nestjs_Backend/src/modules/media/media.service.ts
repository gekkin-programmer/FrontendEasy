import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../modules/providers/cloudinary.service'; 

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  async processUpload(file: any, userId: string) {
    try {
      // 1. Upload to Cloudinary
      const cloudResult = await this.cloudinary.uploadFile(file);
      
      // 2. Find User's Workspace
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { ownedWorkspaces: true }
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      if (!user.ownedWorkspaces.length) {
        throw new NotFoundException('User has no workspace');
      }
      const workspaceId = user.ownedWorkspaces[0].id

      // 3. Save to DB
      const media = await this.prisma.mediaLibrary.create({
        data: {
          uploaderId: userId,
          workspaceId: workspaceId,
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