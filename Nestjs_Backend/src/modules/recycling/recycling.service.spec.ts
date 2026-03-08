import { Test, TestingModule } from '@nestjs/testing';
import { RecyclingService } from './recycling.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('RecyclingService', () => {
  let service: RecyclingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecyclingService,
        {
          provide: PrismaService,
          useValue: {
            post: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(null),
          },
        },
      ],
    }).compile();

    service = module.get<RecyclingService>(RecyclingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
