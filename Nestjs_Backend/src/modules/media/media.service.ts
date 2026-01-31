import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../modules/providers/cloudinary.service'; 
import { PlanType } from '@prisma/client';

@Injectable()
export class MediaService {
  private readonly STORAGE_LIMITS = {
    [PlanType.FREE]: 100 * 1024 * 1024, // 100MB for Free
    [PlanType.STARTER]: 500 * 1024 * 1024, // 500MB
    [PlanType.PROFESSIONAL]: 2 * 1024 * 1024 * 1024, // 2GB
    [PlanType.BUSINESS]: 10 * 1024 * 1024 * 1024, // 10GB
    [PlanType.ENTERPRISE]: 100 * 1024 * 1024 * 1024, // 100GB
  };

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService
  ) {}

  //Query Workspace directly instead of User relations
  async findAll(userId: string) {
    try {
      const workspace = await this.prisma.workspace.findFirst({
        where: { ownerId: userId }
      });

      if (!workspace) return [];

      return this.prisma.mediaLibrary.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Could not fetch media');
    }
  }

  async processUpload(file: any, userId: string) {
    try {
      // 1. Get Workspace and Plan
      const workspace = await this.prisma.workspace.findFirst({
        where: { ownerId: userId },
        include: { owner: true }
      });

      if (!workspace) {
        throw new NotFoundException('No workspace found for this user');
      }

      // 2. Check Storage Limits
      const usage = await this.getStorageUsage(workspace.id);
      const limit = this.STORAGE_LIMITS[workspace.owner.planType] || this.STORAGE_LIMITS[PlanType.FREE];

      if (usage + file.size > limit) {
        throw new ForbiddenException('Storage limit reached. Please upgrade to PRO.');
      }

      // 3. Upload to Cloudinary
      const cloudResult = await this.cloudinary.uploadFile(file);
      
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
      if (error instanceof ForbiddenException || error instanceof NotFoundException) throw error;
      console.error(error);
      throw new InternalServerErrorException('Upload failed');
    }
  }

  async remove(id: string, userId: string) {
    const media = await this.prisma.mediaLibrary.findUnique({
      where: { id },
      include: { workspace: true }
    });

    if (!media) throw new NotFoundException('Media not found');

    // Only owner of the workspace can delete media for now
    if (media.workspace.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Optional: Delete from Cloudinary as well
    // await this.cloudinary.deleteFile(media.url);

    return this.prisma.mediaLibrary.delete({ where: { id } });
  }

  async getStorageUsage(workspaceId: string) {
    const aggregate = await this.prisma.mediaLibrary.aggregate({
      where: { workspaceId },
      _sum: { size: true }
    });
    return aggregate._sum.size || 0;
  }
}