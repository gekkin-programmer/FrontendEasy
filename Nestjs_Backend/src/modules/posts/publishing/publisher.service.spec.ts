import { Test, TestingModule } from '@nestjs/testing';
import { PublisherService } from './publisher.service';
import { PrismaService } from '../../../prisma/prisma.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PublishingService - MVP Tests', () => {
  let service: PublisherService;

  const mockPrismaService = {
    post: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    postSocialAccount: {
      update: jest.fn(),
    },
    socialAccount: {
      update: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublisherService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PublisherService>(PublisherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishPost', () => {
    const postId = 'p123';
    const mockPost = {
      id: postId,
      content: 'Hello World',
      createdById: 'u1',
      status: 'SCHEDULED',
      media: [],
      socialAccounts: [
        {
          id: 'psa1',
          status: 'SCHEDULED',
          socialAccount: {
            id: 'sa1',
            platform: 'FACEBOOK',
            accessToken: 'fb-token',
            platformUserId: 'fb-uid',
          },
        },
      ],
    };

    it('should publish post to Facebook and track results', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockedAxios.post.mockResolvedValue({ data: { id: 'fb-post-123' } });

      await service.publishPost(postId);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('graph.facebook.com'),
        expect.objectContaining({ message: mockPost.content }),
        expect.anything(),
      );
      expect(mockPrismaService.postSocialAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'psa1' },
          data: expect.objectContaining({
            status: 'PUBLISHED',
            platformPostId: 'fb-post-123',
          }),
        }),
      );
      expect(mockPrismaService.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      );
    });

    it('should publish to multiple platforms simultaneously', async () => {
      const multiPost = {
        ...mockPost,
        socialAccounts: [
          ...mockPost.socialAccounts,
          {
            id: 'psa2',
            status: 'SCHEDULED',
            socialAccount: {
              id: 'sa2',
              platform: 'TWITTER',
              accessToken: 'tw-token',
            },
          },
        ],
      };
      mockPrismaService.post.findUnique.mockResolvedValue(multiPost);
      mockedAxios.post.mockResolvedValue({
        data: { id: 'plat-id', data: { id: 'tw-id' } },
      }); // Mock both FB/TW formats

      await service.publishPost(postId);

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.postSocialAccount.update).toHaveBeenCalledTimes(
        2,
      );
    });

    it('should handle partial failures (1 success, 1 fail)', async () => {
      const multiPost = {
        ...mockPost,
        socialAccounts: [
          {
            id: 'psa1',
            status: 'SCHEDULED',
            socialAccount: {
              id: 'sa1',
              platform: 'FACEBOOK',
              accessToken: 't1',
            },
          },
          {
            id: 'psa2',
            status: 'SCHEDULED',
            socialAccount: {
              id: 'sa2',
              platform: 'TWITTER',
              accessToken: 't2',
            },
          },
        ],
      };
      mockPrismaService.post.findUnique.mockResolvedValue(multiPost);

      // 1st call (FB) success
      // 2nd call (TW) fail twice (to exceed retry limit)
      mockedAxios.post
        .mockResolvedValueOnce({ data: { id: 'fb-id' } })
        .mockRejectedValueOnce(new Error('Twitter down'))
        .mockRejectedValueOnce(new Error('Twitter down'));

      await service.publishPost(postId);

      expect(mockPrismaService.postSocialAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'psa2' },
          data: expect.objectContaining({
            status: 'FAILED',
            errorMessage: 'Twitter down',
          }),
        }),
      );
      // Overall post should still be marked PUBLISHED if at least one worked (MVP Logic)
      expect(mockPrismaService.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      );
    });

    it('should retry failed publications before marking as FAILED', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      // Fail once, succeed on 2nd try
      mockedAxios.post
        .mockRejectedValueOnce(new Error('Temporary glitch'))
        .mockResolvedValueOnce({ data: { id: 'recovered-id' } });

      await service.publishPost(postId);

      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.postSocialAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      );
    });

    it('should prevent double publication if post already PUBLISHED', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue({
        ...mockPost,
        status: 'PUBLISHED',
      });

      await service.publishPost(postId);

      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should handle rate limiting (generic error handling)', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockedAxios.post.mockRejectedValue({
        response: { status: 429, data: { message: 'Rate limit reached' } },
      });

      await service.publishPost(postId);

      expect(mockPrismaService.postSocialAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'FAILED',
            errorMessage: 'Rate limit reached',
          }),
        }),
      );
    });
  });
});
