import { Test, TestingModule } from '@nestjs/testing';
import { AiService, AiTone, AiLength } from './ai.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  InternalServerErrorException,
  RequestTimeoutException,
  ForbiddenException,
} from '@nestjs/common';
import { PlanType } from '@prisma/client';

// Mock @google/generative-ai so the model is always initialised
const mockGenerateContent = jest.fn();
jest.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: jest.fn().mockReturnValue({
        generateContent: mockGenerateContent,
      }),
    })),
  };
});

// Mock openai so the groq client can be constructed without network access
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    audio: { transcriptions: { create: jest.fn() } },
    chat: { completions: { create: jest.fn() } },
  }));
});

describe('AiService - MVP Tests', () => {
  let service: AiService;
  let prisma: PrismaService;

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
      if (key === 'GOOGLE_API_KEY') return 'test-gemini-key';
      if (key === 'GROQ_API_KEY') return 'test-groq-key';
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMarketingCopy', () => {
    const userId = 'u1';
    const workspaceId = 'w1';

    beforeEach(() => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        planType: PlanType.PROFESSIONAL,
      });
      mockPrismaService.aiUsageLog.count.mockResolvedValue(0);
      mockPrismaService.aiUsageLog.create.mockResolvedValue({});
    });

    it('should generate post from prompt and track token usage', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Generated Copy' },
      });

      const result = await service.generateMarketingCopy(
        'Product',
        'Visuals',
        AiTone.PROFESSIONAL,
        userId,
        workspaceId,
      );

      expect(result.content).toBe('Generated Copy');
      expect(prisma.aiUsageLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            workspaceId,
          }),
        }),
      );
    });

    it('should apply different tones (professional, casual, nouchi)', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Tone test' },
      });

      await service.generateMarketingCopy(
        'P',
        'V',
        AiTone.NOUCHI,
        userId,
        workspaceId,
      );

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('NOUCHI'),
      );
    });

    it('should apply different lengths (short, medium, long)', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Length test' },
      });

      await service.generateMarketingCopy(
        'P',
        'V',
        AiTone.PROFESSIONAL,
        userId,
        workspaceId,
        AiLength.LONG,
      );

      expect(mockGenerateContent).toHaveBeenCalledWith(
        expect.stringContaining('LONG'),
      );
    });

    it('should enforce usage limits (free: 10 requests/month)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        planType: PlanType.FREE,
      });
      mockPrismaService.aiUsageLog.count.mockResolvedValue(10); // Limit reached

      await expect(
        service.generateMarketingCopy(
          'P',
          'V',
          AiTone.PROFESSIONAL,
          userId,
          workspaceId,
        ),
      ).rejects.toThrow(ForbiddenException);

      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('should allow unlimited for Pro plan', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        planType: PlanType.PROFESSIONAL,
      });
      mockPrismaService.aiUsageLog.count.mockResolvedValue(100); // High count but Pro

      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'Pro test' },
      });

      await service.generateMarketingCopy(
        'P',
        'V',
        AiTone.PROFESSIONAL,
        userId,
        workspaceId,
      );

      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should handle AI API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValue(
        new Error('AI service unavailable'),
      );

      await expect(
        service.generateMarketingCopy(
          'P',
          'V',
          AiTone.PROFESSIONAL,
          userId,
          workspaceId,
        ),
      ).rejects.toThrow(InternalServerErrorException);
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
