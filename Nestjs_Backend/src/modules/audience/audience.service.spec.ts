import { Test, TestingModule } from '@nestjs/testing';
import { AudienceService } from './audience.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AudienceService', () => {
  let service: AudienceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AudienceService,
        {
          provide: PrismaService,
          useValue: {
            audienceMember: {
              findMany: jest.fn(),
              groupBy: jest.fn(),
              upsert: jest.fn(),
            },
            audienceInteraction: {
              create: jest.fn(),
            },
            socialAccount: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<AudienceService>(AudienceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
