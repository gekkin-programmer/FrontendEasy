import { Test, TestingModule } from '@nestjs/testing';
import { SocialAccountsService } from './social-accounts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { getQueueToken } from '@nestjs/bullmq';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SocialAccountsService - MVP Tests', () => {
  let service: SocialAccountsService;
  let prisma: PrismaService;
  let syncQueue: any;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    socialAccount: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SocialAccountsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: getQueueToken('social-sync'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<SocialAccountsService>(SocialAccountsService);
    prisma = module.get<PrismaService>(PrismaService);
    syncQueue = module.get(getQueueToken('social-sync'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleFacebookCallback', () => {
    const callbackData = {
      userId: 'user-123',
      workspaceId: 'ws-123',
      platformUserId: 'fb-user-123',
      name: 'FB User',
      avatar: 'fb-avatar-url',
      accessToken: 'fb-access-token',
      refreshToken: 'fb-refresh-token',
    };

    it('should handle Facebook callback and store access token', async () => {
      mockPrismaService.socialAccount.upsert.mockResolvedValue({
        id: 'acc-123',
        ...callbackData,
        platform: 'FACEBOOK',
      });

      const result = await service.handleFacebookCallback(callbackData);

      expect(prisma.socialAccount.upsert).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          workspaceId_platform_platformUserId: {
            workspaceId: callbackData.workspaceId,
            platform: 'FACEBOOK',
            platformUserId: callbackData.platformUserId,
          },
        }),
        update: expect.objectContaining({
          accessToken: callbackData.accessToken,
        }),
      }));
      expect(mockQueue.add).toHaveBeenCalled();
      expect(result.platform).toBe('FACEBOOK');
    });

    it('should prevent duplicate account connections by using upsert', async () => {
        mockPrismaService.socialAccount.upsert.mockResolvedValue({ id: 'existing-acc' });
        await service.handleFacebookCallback(callbackData);
        expect(prisma.socialAccount.upsert).toHaveBeenCalledTimes(1);
    });
  });

  describe('list and disconnect', () => {
    const userId = 'user-123';
    const workspaceId = 'ws-123';

    it('should list connected accounts for a workspace', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        ownedWorkspaces: [{ id: workspaceId }],
      });
      mockPrismaService.socialAccount.findMany.mockResolvedValue([{ id: 'acc-1', platform: 'FACEBOOK' }]);

      const result = await service.findAll(userId, workspaceId);

      expect(result).toHaveLength(1);
      expect(prisma.socialAccount.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { workspaceId },
      }));
    });

    it('should disconnect account', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        ownedWorkspaces: [{ id: workspaceId }],
      });
      mockPrismaService.socialAccount.findFirst.mockResolvedValue({ id: 'acc-1', workspaceId });
      mockPrismaService.socialAccount.delete.mockResolvedValue({ id: 'acc-1' });

      const result = await service.disconnect('acc-1', userId);

      expect(prisma.socialAccount.delete).toHaveBeenCalledWith({ where: { id: 'acc-1' } });
      expect(result.id).toBe('acc-1');
    });

    it('should throw NotFoundException if account not found or access denied', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({
          id: userId,
          ownedWorkspaces: [{ id: workspaceId }],
        });
        mockPrismaService.socialAccount.findFirst.mockResolvedValue(null);

        await expect(service.disconnect('invalid-acc', userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Facebook specific logic', () => {
    it('should fetch Facebook pages using user access token', async () => {
      const mockPages = { data: [{ id: 'page-1', name: 'Page 1', access_token: 'page-token' }] };
      mockedAxios.get.mockResolvedValue({ data: mockPages });

      const result = await service.getFacebookPages('user-token');

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining('graph.facebook.com/me/accounts'));
      expect(result).toEqual(mockPages.data);
    });

    it('should handle OAuth errors gracefully during page fetch', async () => {
      mockedAxios.get.mockRejectedValue({ response: { data: { error: 'OAuth error' } } });
      await expect(service.getFacebookPages('bad-token')).rejects.toThrow(UnauthorizedException);
    });

    it('should support linking a specific Facebook page', async () => {
        const pageData = { pageId: 'p1', pageName: 'My Page', pageAccessToken: 'pt1' };
        mockPrismaService.user.findUnique.mockResolvedValue({ id: 'u1', ownedWorkspaces: [{ id: 'w1' }] });
        mockPrismaService.socialAccount.upsert.mockResolvedValue({ id: 'acc-p1', platform: 'FACEBOOK' });

        const result = await service.linkPageAccount('u1', pageData);
        expect(prisma.socialAccount.upsert).toHaveBeenCalled();
        expect(result.platform).toBe('FACEBOOK');
    });
  });
});
