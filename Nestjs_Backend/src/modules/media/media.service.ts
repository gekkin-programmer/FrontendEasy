import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { GcsService } from '../../modules/providers/gcs.service';
import { PlanType } from '@prisma/client';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly STORAGE_LIMITS = {
    [PlanType.FREE]: 100 * 1024 * 1024,
    [PlanType.STARTER]: 500 * 1024 * 1024,
    [PlanType.PROFESSIONAL]: 2 * 1024 * 1024 * 1024,
    [PlanType.BUSINESS]: 10 * 1024 * 1024 * 1024,
    [PlanType.ENTERPRISE]: 100 * 1024 * 1024 * 1024,
  };

  constructor(
    private prisma: PrismaService,
    private gcs: GcsService,
  ) {}

  private async getWorkspace(userId: string) {
    const workspace = await this.prisma.workspace.findFirst({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: { owner: true },
    });
    if (!workspace) throw new NotFoundException('No workspace found');
    return workspace;
  }

  async findAll(userId: string, folderId?: string) {
    const workspace = await this.getWorkspace(userId);

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

  async createFolder(name: string, userId: string, parentId?: string) {
    const workspace = await this.getWorkspace(userId);
    return this.prisma.mediaFolder.create({
      data: {
        name,
        workspaceId: workspace.id,
        parentId: parentId || null,
      },
    });
  }

  async processUpload(file: any, userId: string, folderId?: string) {
    const workspace = await this.getWorkspace(userId);

    const usage = await this.getStorageUsage(workspace.id);
    const limit =
      this.STORAGE_LIMITS[workspace.owner.planType] ||
      this.STORAGE_LIMITS[PlanType.FREE];

    if (usage + file.size > limit) {
      throw new ForbiddenException(
        'Storage limit reached. Please upgrade to PRO.',
      );
    }

    const cloudResult = await this.gcs.uploadFile(file);

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

  // Runs daily at 03:00 — refreshes GCS signed URLs (7-day TTL, daily renewal = 6-day buffer)
  @Cron('0 3 * * *')
  async refreshGcsSignedUrls() {
    const assets = await this.prisma.mediaLibrary.findMany({
      where: { url: { contains: 'X-Goog-Algorithm' } },
      select: { id: true, url: true },
    });

    if (assets.length === 0) return;

    let refreshed = 0;
    for (const asset of assets) {
      const newUrl = await this.gcs.refreshSignedUrl(asset.url);
      if (newUrl) {
        await this.prisma.mediaLibrary.update({
          where: { id: asset.id },
          data: { url: newUrl },
        });
        refreshed++;
      }
    }

    this.logger.log(`GCS signed URL refresh: ${refreshed}/${assets.length} renewed`);
  }
}
