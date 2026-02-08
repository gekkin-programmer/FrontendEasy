import { Test, TestingModule } from '@nestjs/testing';
import { SmartSchedulingService } from './smart-scheduling.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';

describe('SmartSchedulingService', () => {
  let service: SmartSchedulingService;
  let prisma: PrismaService;
  let http: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmartSchedulingService,
        {
          provide: PrismaService,
          useValue: {
            postSocialAccount: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn().mockReturnValue(of({ data: { suggestions: [{ hour: 10, score: 0.9, confidence: 'high' }] } })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://localhost:8000'),
          },
        },
      ],
    }).compile();

    service = module.get<SmartSchedulingService>(SmartSchedulingService);
    prisma = module.get<PrismaService>(PrismaService);
    http = module.get<HttpService>(HttpService);
  });

  it('should call ML service and return suggestions', async () => {
    const result = await service.getSuggestions('ws-123', 'FACEBOOK');
    
    expect(prisma.postSocialAccount.findMany).toHaveBeenCalled();
    expect(http.post).toHaveBeenCalledWith(
      'http://localhost:8000/predict',
      expect.objectContaining({
        workspace_id: 'ws-123',
        platform: 'FACEBOOK',
        historical_data: []
      })
    );
    expect(result.suggestions[0].hour).toBe(10);
  });
});