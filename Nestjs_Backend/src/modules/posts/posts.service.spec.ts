import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PostStatus, ApprovalStatus } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('PostsService', () => {
  let service: PostsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post with correct data', async () => {
      const dto = {
        content: 'Test content',
        socialAccountIds: ['acc-1'],
        mediaIds: [],
        scheduledFor: null,
      };
      const userId = 'user-1';
      const workspaceId = 'ws-1';

      const mockCreatedPost = {
        id: 'post-1',
        content: dto.content,
        workspaceId,
        createdById: userId,
        status: PostStatus.DRAFT,
      };

      (prisma.post.create as jest.Mock).mockResolvedValue(mockCreatedPost);

      const result = await service.create(dto as any, userId, workspaceId);

      expect(prisma.post.create).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedPost);
    });

    it('should set status to SCHEDULED if scheduledFor is provided', async () => {
      const dto = {
        content: 'Scheduled content',
        socialAccountIds: ['acc-1'],
        scheduledFor: new Date().toISOString(),
      };
      
      await service.create(dto as any, 'u1', 'w1');
      
      const createCall = (prisma.post.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.status).toBe(PostStatus.SCHEDULED);
    });
  });

  describe('findAll', () => {
    it('should list posts by workspace', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([{ id: 'p1' }]);
      const result = await service.findAll('ws-1');
      expect(result).toHaveLength(1);
      expect(prisma.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ workspaceId: 'ws-1' })
      }));
    });
  });

  describe('findOne', () => {
    it('should return a post', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue({ id: 'p1' });
      const result = await service.findOne('p1');
      expect(result.id).toBe('p1');
    });

    it('should throw NotFoundException if post not found', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue(null);
      await expect(service.findOne('p1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue({ id: 'p1' });
      mockPrismaService.post.update.mockResolvedValue({ id: 'p1', content: 'new' });
      
      const result = await service.update('p1', { content: 'new' } as any, 'u1');
      expect(result.content).toBe('new');
    });
  });

  describe('remove', () => {
    it('should delete a post', async () => {
      mockPrismaService.post.findFirst.mockResolvedValue({ id: 'p1' });
      await service.remove('p1', 'ws-1');
      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
    });
  });

  describe('approve', () => {
    it('should approve a post and set to SCHEDULED', async () => {
      mockPrismaService.post.update.mockResolvedValue({ id: 'p1', approvalStatus: ApprovalStatus.APPROVED });
      const result = await service.approve('p1', 'u1');
      expect(prisma.post.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          approvalStatus: ApprovalStatus.APPROVED,
          status: PostStatus.SCHEDULED
        })
      }));
    });
  });
});