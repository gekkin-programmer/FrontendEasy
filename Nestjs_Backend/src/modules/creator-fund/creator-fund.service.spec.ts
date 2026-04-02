import { Test, TestingModule } from '@nestjs/testing';
import { CreatorFundService } from './creator-fund.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CreatorFundService', () => {
  let service: CreatorFundService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatorFundService,
        {
          provide: PrismaService,
          useValue: {
            creatorFundApplication: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CreatorFundService>(CreatorFundService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
