import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PostStatus } from '@prisma/client';

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

      expect(prisma.post.create).toHaveBeenCalledWith({
        data: {
          content: dto.content,
          status: PostStatus.DRAFT,
          scheduledFor: null,
          workspaceId,
          createdById: userId,
          socialAccounts: {
            create: [{ socialAccount: { connect: { id: 'acc-1' } }, status: PostStatus.DRAFT }],
          },
          media: {
            create: [],
          },
        },
        include: { media: true, socialAccounts: true },
      });

      expect(result).toEqual(mockCreatedPost);
    });
  });
});
