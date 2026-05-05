import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { AppEventsGateway } from '../../app-events/app-events.gateway';

describe('ChatService', () => {
  let service: ChatService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: AppEventsGateway,
          useValue: { server: { to: jest.fn().mockReturnThis(), emit: jest.fn() } },
        },
        {
          provide: PrismaService,
          useValue: {
            chatChannel: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              create: jest.fn(),
            },
            chatMessage: {
              create: jest.fn(),
              findMany: jest.fn(),
            },
            workspace: {
              findFirst: jest.fn(),
            },
            workspaceMember: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a channel', async () => {
    const workspaceId = 'ws-1';
    const userId = 'user-1';
    const dto = { name: 'General', description: 'General channel' };

    const prisma = module.get<PrismaService>(PrismaService);
    (prisma.workspace.findFirst as jest.Mock).mockResolvedValue({
      id: workspaceId,
      ownerId: userId,
    });
    (prisma.chatChannel.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.chatChannel.create as jest.Mock).mockResolvedValue({
      id: 'ch-1',
      name: 'general',
      description: dto.description,
      workspaceId,
    });

    const result = await service.createChannel(workspaceId, userId, dto);
    expect(result).toBeDefined();
    expect(result.name).toBe('general');
  });
});
