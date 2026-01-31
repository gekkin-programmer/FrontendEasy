import { Test, TestingModule } from '@nestjs/testing';
import { AiService, AiTone, MarketingFramework, AiLength } from './ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { InternalServerErrorException, RequestTimeoutException, ForbiddenException } from '@nestjs/common';
import { PlanType } from '@prisma/client';

jest.mock('openai');

describe('AiService - MVP Tests', () => {
  let service: AiService;
  let prisma: PrismaService;
  let config: ConfigService;

  const mockPrismaService = {
    aiUsageLog: {
      create: jest.fn(),
      count: jest.fn(),
    },
    aiFeedback: {
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'GROQ_API_KEY') return 'test-key';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    prisma = module.get<PrismaService>(PrismaService);
    config = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMarketingCopy', () => {
    const userId = 'u1';
    const workspaceId = 'w1';

    beforeEach(() => {
        mockPrismaService.user.findUnique.mockResolvedValue({ id: userId, planType: PlanType.PROFESSIONAL });
        mockPrismaService.aiUsageLog.count.mockResolvedValue(0);
    });

    it('should generate post from prompt and track token usage', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Generated Copy' } }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      };

      (OpenAI.prototype.chat as any) = {
        completions: {
          create: jest.fn().mockResolvedValue(mockResponse),
        },
      };

      const result = await service.generateMarketingCopy(
        'Product',
        'Visuals',
        AiTone.PROFESSIONAL,
        userId,
        workspaceId
      );

      expect(result.content).toBe('Generated Copy');
      expect(prisma.aiUsageLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          userId,
          workspaceId,
          totalTokens: 30,
        }),
      }));
    });

    it('should apply different tones (professional, casual, nouchi)', async () => {
        (OpenAI.prototype.chat as any) = {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Tone test' } }],
              usage: { total_tokens: 10 },
            }),
          },
        };

        await service.generateMarketingCopy('P', 'V', AiTone.NOUCHI, userId, workspaceId);
        
        expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalledWith(expect.objectContaining({
            messages: expect.arrayContaining([
                expect.objectContaining({
                    content: expect.stringContaining('TONE: NOUCHI')
                })
            ])
        }));
    });

    it('should apply different lengths (short, medium, long)', async () => {
        (OpenAI.prototype.chat as any) = {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Length test' } }],
              usage: { total_tokens: 10 },
            }),
          },
        };

        await service.generateMarketingCopy('P', 'V', AiTone.PROFESSIONAL, userId, workspaceId, AiLength.LONG);
        
        expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalledWith(expect.objectContaining({
            messages: expect.arrayContaining([
                expect.objectContaining({
                    content: expect.stringContaining('LENGTH: LONG')
                })
            ])
        }));
    });

    it('should enforce usage limits (free: 10 requests/month)', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({ planType: PlanType.FREE });
        mockPrismaService.aiUsageLog.count.mockResolvedValue(10); // Limit reached

        await expect(service.generateMarketingCopy('P', 'V', AiTone.PROFESSIONAL, userId, workspaceId))
            .rejects.toThrow(ForbiddenException);
        
        expect(OpenAI.prototype.chat.completions.create).not.toHaveBeenCalled();
    });

    it('should allow unlimited for Pro plan', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue({ planType: PlanType.PROFESSIONAL });
        mockPrismaService.aiUsageLog.count.mockResolvedValue(100); // High count but Pro

        (OpenAI.prototype.chat as any) = {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'Pro test' } }],
              usage: { total_tokens: 10 },
            }),
          },
        };

        await service.generateMarketingCopy('P', 'V', AiTone.PROFESSIONAL, userId, workspaceId);
        
        expect(OpenAI.prototype.chat.completions.create).toHaveBeenCalled();
    });

    it('should handle AI API errors (Rate Limit)', async () => {
        (OpenAI.prototype.chat as any) = {
          completions: {
            create: jest.fn().mockRejectedValue({ status: 429, message: 'Rate limited' }),
          },
        };

        await expect(service.generateMarketingCopy('P', 'V', AiTone.PROFESSIONAL, userId, workspaceId))
            .rejects.toThrow(InternalServerErrorException);
    });

    it('should handle AI API errors (Timeout)', async () => {
        (OpenAI.prototype.chat as any) = {
          completions: {
            create: jest.fn().mockRejectedValue({ code: 'ETIMEDOUT', message: 'Timeout' }),
          },
        };

        await expect(service.generateMarketingCopy('P', 'V', AiTone.PROFESSIONAL, userId, workspaceId))
            .rejects.toThrow(RequestTimeoutException);
    });
  });

  describe('feedback', () => {
    it('should log feedback', async () => {
      const feedbackDto = { messageId: 'm1', rating: 1, comment: 'Great!' };
      mockPrismaService.aiFeedback.create.mockResolvedValue({ id: 'f1' });

      await service.submitFeedback('u1', feedbackDto);

      expect(prisma.aiFeedback.create).toHaveBeenCalledWith({
        data: {
          userId: 'u1',
          aiMessageId: 'm1',
          rating: 1,
          feedbackText: 'Great!',
        },
      });
    });
  });
});