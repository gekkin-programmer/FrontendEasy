import { Test, TestingModule } from '@nestjs/testing';
import { BoardsService } from './boards.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AppEventsGateway } from '../app-events/app-events.gateway';

describe('BoardsService', () => {
  let service: BoardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: PrismaService,
          useValue: {
            board: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            boardColumn: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            boardCard: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            cardComment: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            workspaceMember: {
              findUnique: jest.fn(),
            },
          },
        },
        {
          provide: AppEventsGateway,
          useValue: {
            sendToWorkspace: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
