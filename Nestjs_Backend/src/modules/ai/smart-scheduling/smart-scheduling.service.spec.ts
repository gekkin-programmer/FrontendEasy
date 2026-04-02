import { Test, TestingModule } from '@nestjs/testing';
import { SmartSchedulingService } from './smart-scheduling.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('SmartSchedulingService', () => {
  let service: SmartSchedulingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmartSchedulingService,
        {
          provide: PrismaService,
          useValue: {
            post: { findMany: jest.fn() },
          },
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
