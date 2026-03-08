import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CloudinaryService } from '../../modules/providers/cloudinary.service';
import { PlanType } from '@prisma/client';
import axios from 'axios';

@Injectable()
export class MediaService {
  private readonly STORAGE_LIMITS = {
    [PlanType.FREE]: 100 * 1024 * 1024,
    [PlanType.STARTER]: 500 * 1024 * 1024,
    [PlanType.PROFESSIONAL]: 2 * 1024 * 1024 * 1024,
    [PlanType.BUSINESS]: 10 * 1024 * 1024 * 1024,
    [PlanType.ENTERPRISE]: 100 * 1024 * 1024 * 1024,
  };

  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  private async getWorkspace(userId: string, workspaceId?: string) {
    if (workspaceId) {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { owner: true },
      });
      if (!workspace) throw new NotFoundException('Workspace not found');
      return workspace;
    }

    const workspace = await this.prisma.workspace.findFirst({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: { owner: true },
    });
    if (!workspace) throw new NotFoundException('No workspace found');
    return workspace;
  }

  async findAll(userId: string, folderId?: string, workspaceId?: string) {
    const workspace = await this.getWorkspace(userId, workspaceId);

    // Normalize folderId: empty string or 'null' string should be treated as null (root)
    const targetFolderId = folderId === 'null' || !folderId ? null : folderId;

    // Get Folders
    const folders = await this.prisma.mediaFolder.findMany({
      where: {
        workspaceId: workspace.id,
        parentId: targetFolderId,
      },
      orderBy: { name: 'asc' },
    });

    // Get Assets
    const assets = await this.prisma.mediaLibrary.findMany({
      where: {
        workspaceId: workspace.id,
        folderId: targetFolderId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return { folders, assets };
  }

  async createFolder(
    name: string,
    userId: string,
    parentId?: string,
    workspaceId?: string,
  ) {
    const workspace = await this.getWorkspace(userId, workspaceId);
    return this.prisma.mediaFolder.create({
      data: {
        name,
        workspaceId: workspace.id,
        parentId: parentId || null,
      },
    });
  }

  async processUpload(
    file: any,
    userId: string,
    folderId?: string,
    workspaceId?: string,
  ) {
    const workspace = await this.getWorkspace(userId, workspaceId);

    const usage = await this.getStorageUsage(workspace.id);
    const limit =
      this.STORAGE_LIMITS[workspace.owner.planType] ||
      this.STORAGE_LIMITS[PlanType.FREE];

    if (usage + file.size > limit) {
      throw new ForbiddenException(
        'Storage limit reached. Please upgrade to PRO.',
      );
    }

    const cloudResult = await this.cloudinary.uploadFile(file);

    const media = await this.prisma.mediaLibrary.create({
      data: {
        uploadedById: userId,
        workspaceId: workspace.id,
        url: cloudResult.secure_url,
        filename: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        folderId: folderId || null,
      },
    });

    return { message: 'File uploaded', media };
  }

  async importFromUrl(
    url: string,
    userId: string,
    folderId?: string,
    workspaceId?: string,
  ) {
    const workspace = await this.getWorkspace(userId, workspaceId);

    // 1. Fetch file info to check size
    const head = await axios.head(url);
    const size = parseInt(head.headers['content-length'] || '0');
    const mimeType = head.headers['content-type'] || 'image/png';

    const usage = await this.getStorageUsage(workspace.id);
    const limit =
      this.STORAGE_LIMITS[workspace.owner.planType] ||
      this.STORAGE_LIMITS[PlanType.FREE];

    if (size > 0 && usage + size > limit) {
      throw new ForbiddenException(
        'Storage limit reached. Please upgrade to PRO.',
      );
    }

    // 2. Upload to Cloudinary via URL
    const cloudResult = await this.cloudinary.uploadUrl(url);

    // 3. Save to DB
    const filename =
      url.split('/').pop()?.split('?')[0] || `imported_${Date.now()}`;

    const media = await this.prisma.mediaLibrary.create({
      data: {
        uploadedById: userId,
        workspaceId: workspace.id,
        url: cloudResult.secure_url,
        filename,
        mimeType,
        size: size || cloudResult.bytes || 0,
        folderId: folderId || null,
      },
    });

    return { message: 'Asset imported', media };
  }

  async moveAsset(assetId: string, folderId: string | null, userId: string) {
    const workspace = await this.getWorkspace(userId);
    return this.prisma.mediaLibrary.updateMany({
      where: { id: assetId, workspaceId: workspace.id },
      data: { folderId },
    });
  }

  async remove(id: string, userId: string) {
    const workspace = await this.getWorkspace(userId);
    const media = await this.prisma.mediaLibrary.findFirst({
      where: { id, workspaceId: workspace.id },
    });

    if (!media) throw new NotFoundException('Media not found');

    return this.prisma.mediaLibrary.delete({ where: { id } });
  }

  async removeFolder(id: string, userId: string) {
    const workspace = await this.getWorkspace(userId);
    // Recursively handle or just delete if empty (simplified for now)
    return this.prisma.mediaFolder.deleteMany({
      where: { id, workspaceId: workspace.id },
    });
  }

  async getStorageUsage(workspaceId: string) {
    const aggregate = await this.prisma.mediaLibrary.aggregate({
      where: { workspaceId },
      _sum: { size: true },
    });
    return aggregate._sum.size || 0;
  }
}
