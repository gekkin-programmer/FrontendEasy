import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AppEventsGateway } from '../app-events/app-events.gateway';
import { PostStatus } from '@prisma/client';
import { ForbiddenException } from '@nestjs/common';

const mockAppEventsGateway = {
  sendToWorkspace: jest.fn(),
  sendToUser: jest.fn(),
};

const mockPrismaService = {
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  workspace: {
    update: jest.fn(),
    findUnique: jest.fn(),
  },
};

describe('PostsService - MVP Tests', () => {
  let service: PostsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AppEventsGateway, useValue: mockAppEventsGateway },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user-1';
    const workspaceId = 'ws-1';

    it('should create post with text only', async () => {
      const dto = { content: 'Text only post', socialAccountIds: ['acc-1'] };
      mockPrismaService.post.create.mockResolvedValue({ id: 'p1', ...dto });

      const result = await service.create(dto as any, userId, workspaceId);

      expect(prisma.post.create).toHaveBeenCalled();
      expect(prisma.workspace.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: workspaceId },
          data: { currentPostCount: { increment: 1 } },
        }),
      );
      expect(result.content).toBe(dto.content);
    });

    it('should create post with text + image', async () => {
      const dto = {
        content: 'Post with image',
        socialAccountIds: ['acc-1'],
        mediaIds: ['m1'],
      };
      mockPrismaService.post.create.mockResolvedValue({ id: 'p1', ...dto });

      await service.create(dto as any, userId, workspaceId);

      expect(prisma.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            media: {
              create: [{ media: { connect: { id: 'm1' } }, order: 0 }],
            },
          }),
        }),
      );
    });

    // Note: Content empty check is usually in DTO, but we test service resilience
    it('should create even if content is empty (if media present)', async () => {
      const dto = {
        content: '',
        socialAccountIds: ['acc-1'],
        mediaIds: ['m1'],
      };
      mockPrismaService.post.create.mockResolvedValue({ id: 'p1', ...dto });
      const result = await service.create(dto as any, userId, workspaceId);
      expect(result).toBeDefined();
    });
  });

  describe('listing and search', () => {
    const workspaceId = 'ws-1';

    it('should list posts for workspace', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([
        { id: 'p1' },
        { id: 'p2' },
      ]);
      const result = await service.findAll(workspaceId);
      expect(result).toHaveLength(2);
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ workspaceId }),
        }),
      );
    });

    it('should filter posts by status', async () => {
      await service.findAll(workspaceId, { status: PostStatus.DRAFT });
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: PostStatus.DRAFT }),
        }),
      );
    });

    // Search logic is currently simplified in findAll, let's verify if search by content is requested
    // If not implemented in service, we might need to add it or acknowledge it's via query params
  });

  describe('update', () => {
    it('should update post content (draft only)', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue({
        id: 'p1',
        status: PostStatus.DRAFT,
      });
      mockPrismaService.post.update.mockResolvedValue({
        id: 'p1',
        content: 'Updated',
      });

      const result = await service.update(
        'p1',
        { content: 'Updated' } as any,
        'u1',
      );
      expect(result.content).toBe('Updated');
    });

    it('should prevent editing published post', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue({
        id: 'p1',
        status: PostStatus.PUBLISHED,
      });
      await expect(
        service.update('p1', { content: 'hack' } as any, 'u1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete post', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue({
        id: 'p1',
        status: PostStatus.DRAFT,
      });
      await service.remove('p1', 'ws-1');
      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });

    it('should delete published post (no restriction on published)', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue({
        id: 'p1',
        status: PostStatus.PUBLISHED,
      });
      mockPrismaService.post.delete.mockResolvedValue({ id: 'p1' });
      await service.remove('p1', 'ws-1');
      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });
  });

  describe('limits (Service perspective)', () => {
    it('should increment workspace post count on creation', async () => {
      const dto = { content: 'Count test', socialAccountIds: ['acc-1'] };
      mockPrismaService.post.create.mockResolvedValue({ id: 'p1' });

      await service.create(dto as any, 'u1', 'w1');

      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: 'w1' },
        data: { currentPostCount: { increment: 1 } },
      });
    });
  });
});
