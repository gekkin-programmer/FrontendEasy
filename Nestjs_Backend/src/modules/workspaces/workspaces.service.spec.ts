import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('WorkspacesService', () => {
  let service: WorkspacesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    workspace: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    workspaceMember: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspacesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a workspace and add owner', async () => {
      const dto = { name: 'Test Workspace' };
      const userId = 'user-1';
      
      mockPrismaService.workspace.create.mockResolvedValue({ id: 'ws-1', ...dto });

      const result = await service.create(dto as any, userId);

      expect(prisma.workspace.create).toHaveBeenCalled();
      expect(result.name).toBe(dto.name);
    });
  });

  describe('findAll', () => {
    it('should return workspaces for user', async () => {
      const userId = 'user-1';
      mockPrismaService.workspace.findMany.mockResolvedValue([{ id: 'ws-1' }]);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(prisma.workspace.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return workspace if user is member', async () => {
      const userId = 'user-1';
      const wsId = 'ws-1';
      const workspace = {
        id: wsId,
        members: [{ userId }],
      };
      mockPrismaService.workspace.findUnique.mockResolvedValue(workspace);

      const result = await service.findOne(wsId, userId);

      expect(result).toEqual(workspace);
    });

    it('should throw ForbiddenException if user is not member', async () => {
      const userId = 'user-1';
      const wsId = 'ws-1';
      mockPrismaService.workspace.findUnique.mockResolvedValue({
        id: wsId,
        members: [{ userId: 'other-user' }],
      });

      await expect(service.findOne(wsId, userId)).rejects.toThrow(ForbiddenException);
    });
  });
});
