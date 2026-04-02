import { Test, TestingModule } from '@nestjs/testing';
import { SchedulerService } from './scheduler.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { PublisherService } from '../publishing/publisher.service';

describe('SchedulingService - MVP Tests', () => {
  let service: SchedulerService;
  let prisma: PrismaService;
  let publisher: PublisherService;

  const mockPrismaService = {
    post: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockPublisherService = {
    publishPost: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PublisherService, useValue: mockPublisherService },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
    prisma = module.get<PrismaService>(PrismaService);
    publisher = module.get<PublisherService>(PublisherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('schedulePost', () => {
    it('should schedule post for future date', async () => {
      const futureDate = new Date(Date.now() + 100000);
      mockPrismaService.post.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'DRAFT',
      });
      mockPrismaService.post.update.mockResolvedValue({
        id: 'p1',
        status: 'SCHEDULED',
        scheduledFor: futureDate,
      });

      const result = await service.schedulePost('p1', futureDate);

      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: { scheduledFor: futureDate, status: 'SCHEDULED' },
        }),
      );
      expect(result.status).toBe('SCHEDULED');
    });

    it('should reject past date', async () => {
      const pastDate = new Date(Date.now() - 100000);
      await expect(service.schedulePost('p1', pastDate)).rejects.toThrow(
        'Cannot schedule post in the past',
      );
    });

    it('should prevent scheduling same post twice', async () => {
      const futureDate = new Date(Date.now() + 100000);
      mockPrismaService.post.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'SCHEDULED',
      });

      await expect(service.schedulePost('p1', futureDate)).rejects.toThrow(
        'Post is already scheduled or published',
      );
    });
  });

  describe('reschedule and cancel', () => {
    it('should reschedule post to new time', async () => {
      const newDate = new Date(Date.now() + 200000);
      mockPrismaService.post.update.mockResolvedValue({
        id: 'p1',
        scheduledFor: newDate,
      });

      const result = await service.reschedulePost('p1', newDate);
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { scheduledFor: newDate },
        }),
      );
      expect(result.scheduledFor).toEqual(newDate);
    });

    it('should cancel scheduled post', async () => {
      mockPrismaService.post.update.mockResolvedValue({
        id: 'p1',
        status: 'DRAFT',
      });

      const result = await service.cancelScheduledPost('p1');
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { status: 'DRAFT', scheduledFor: null },
        }),
      );
      expect(result.status).toBe('DRAFT');
    });
  });

  describe('listing', () => {
    it('should list scheduled posts', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([
        { id: 'p1', status: 'SCHEDULED' },
      ]);
      const result = await service.getScheduledPosts('ws-1');
      expect(result).toHaveLength(1);
      expect(prisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { workspaceId: 'ws-1', status: 'SCHEDULED' },
        }),
      );
    });
  });

  describe('automation', () => {
    it('should auto-publish post at scheduled time', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([
        { id: 'p1', status: 'SCHEDULED' },
      ]);
      mockPrismaService.post.update.mockResolvedValue({
        id: 'p1',
        status: 'PUBLISHING',
      });

      await service.handleCron();

      expect(prisma.post.findMany).toHaveBeenCalled();
      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'p1' },
          data: { status: 'PUBLISHING' },
        }),
      );
      expect(publisher.publishPost).toHaveBeenCalledWith('p1');
    });
  });

  describe('timezone handling', () => {
    it('should handle timezone edge cases (simplified check)', async () => {
      // Use a far future year to avoid "past date" error
      const date = new Date('2030-01-30T12:00:00Z');
      mockPrismaService.post.findUnique.mockResolvedValue({
        id: 'p1',
        status: 'DRAFT',
      });

      await service.schedulePost('p1', date, 'GMT+1');

      expect(prisma.post.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ scheduledFor: date }),
        }),
      );
    });
  });
});
