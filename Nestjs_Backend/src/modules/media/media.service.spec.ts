import { Test, TestingModule } from '@nestjs/testing';
import { MediaService } from './media.service';
import { PrismaService } from '../../prisma/prisma.service';
import { GcsService } from '../../modules/providers/gcs.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PlanType } from '@prisma/client';

describe('MediaService - MVP Tests', () => {
  let service: MediaService;
  let prisma: PrismaService;
  let gcs: GcsService;

  const mockPrismaService = {
    workspace: {
      findFirst: jest.fn(),
    },
    mediaLibrary: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
    },
    mediaFolder: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockGcsService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: GcsService, useValue: mockGcsService },
      ],
    }).compile();

    service = module.get<MediaService>(MediaService);
    prisma = module.get<PrismaService>(PrismaService);
    gcs = module.get<GcsService>(GcsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processUpload', () => {
    const userId = 'u1';
    const mockFile = {
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: Buffer.from('test'),
    };

    it('should upload image to Cloudinary and create record', async () => {
      mockPrismaService.workspace.findFirst.mockResolvedValue({
        id: 'ws1',
        owner: { planType: PlanType.PROFESSIONAL },
      });
      mockPrismaService.mediaLibrary.aggregate.mockResolvedValue({
        _sum: { size: 0 },
      });
      mockGcsService.uploadFile.mockResolvedValue({
        secure_url: 'http://cloud.url',
      });
      mockPrismaService.mediaLibrary.create.mockResolvedValue({
        id: 'm1',
        url: 'http://cloud.url',
      });

      const result = await service.processUpload(mockFile, userId);

      expect(gcs.uploadFile).toHaveBeenCalledWith(mockFile);
      expect(prisma.mediaLibrary.create).toHaveBeenCalled();
      expect(result.media.url).toBe('http://cloud.url');
    });

    it('should enforce storage limits (Free Plan)', async () => {
      mockPrismaService.workspace.findFirst.mockResolvedValue({
        id: 'ws1',
        owner: { planType: PlanType.FREE },
      });
      // Mock usage already at 100MB
      mockPrismaService.mediaLibrary.aggregate.mockResolvedValue({
        _sum: { size: 100 * 1024 * 1024 },
      });

      await expect(service.processUpload(mockFile, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('findAll and remove', () => {
    it('should list workspace media', async () => {
      mockPrismaService.workspace.findFirst.mockResolvedValue({ id: 'ws1' });
      mockPrismaService.mediaFolder.findMany.mockResolvedValue([]);
      mockPrismaService.mediaLibrary.findMany.mockResolvedValue([{ id: 'm1' }]);

      const result = await service.findAll('u1');
      expect(result.assets).toHaveLength(1);
    });

    it('should delete media (only owner)', async () => {
      mockPrismaService.workspace.findFirst.mockResolvedValue({ id: 'ws1' });
      mockPrismaService.mediaLibrary.findFirst.mockResolvedValue({
        id: 'm1',
        workspaceId: 'ws1',
      });
      mockPrismaService.mediaLibrary.delete.mockResolvedValue({ id: 'm1' });

      await service.remove('m1', 'u1');
      expect(prisma.mediaLibrary.delete).toHaveBeenCalled();
    });

    it('should prevent non-owner from deleting', async () => {
      mockPrismaService.workspace.findFirst.mockResolvedValue({ id: 'ws1' });
      mockPrismaService.mediaLibrary.findFirst.mockResolvedValue(null);

      await expect(service.remove('m1', 'u1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getStorageUsage', () => {
    it('should track storage usage', async () => {
      mockPrismaService.mediaLibrary.aggregate.mockResolvedValue({
        _sum: { size: 5000 },
      });
      const result = await service.getStorageUsage('ws1');
      expect(result).toBe(5000);
    });
  });
});
