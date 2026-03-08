import { Test, TestingModule } from '@nestjs/testing';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('WorkspacesService - MVP Tests', () => {
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
    jest.clearAllMocks();
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
    it('should create workspace with owner as admin', async () => {
      const dto = { name: 'New Workspace' };
      const userId = 'user-1';
      
      mockPrismaService.workspace.create.mockResolvedValue({ id: 'ws-1', ...dto });

      const result = await service.create(dto as any, userId);

      expect(prisma.workspace.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          ownerId: userId,
          members: expect.objectContaining({
            create: expect.objectContaining({
              userId,
              role: 'OWNER'
            })
          })
        })
      }));
      expect(result.name).toBe(dto.name);
    });
  });

  describe('findAll and findOne', () => {
    it('should list user workspaces', async () => {
      const userId = 'user-1';
      mockPrismaService.workspace.findMany.mockResolvedValue([{ id: 'ws-1' }]);

      const result = await service.findAll(userId);

      expect(result).toHaveLength(1);
      expect(prisma.workspace.findMany).toHaveBeenCalled();
    });

    it('should get workspace details if member', async () => {
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
  });

  describe('update and remove', () => {
    it('should update workspace name/description', async () => {
      const wsId = 'ws-1';
      const userId = 'owner-1';
      const updateDto = { name: 'Updated Name' };

      // Helper verifyAdminRole mock
      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({ role: 'OWNER' });
      mockPrismaService.workspace.update.mockResolvedValue({ id: wsId, ...updateDto });

      const result = await service.update(wsId, updateDto as any, userId);
      expect(result.name).toBe('Updated Name');
    });

    it('should delete workspace (only owner)', async () => {
      const wsId = 'ws-1';
      const userId = 'owner-1';

      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({ role: 'OWNER' });
      mockPrismaService.workspace.update.mockResolvedValue({ id: wsId, status: 'INACTIVE' });

      await service.remove(wsId, userId);
      expect(prisma.workspace.update).toHaveBeenCalledWith({
        where: { id: wsId },
        data: { status: 'INACTIVE' }
      });
    });

    it('should prevent non-owner from deleting', async () => {
      const wsId = 'ws-1';
      const userId = 'non-owner-id';

      mockPrismaService.workspaceMember.findUnique.mockResolvedValue({ role: 'ADMIN' });

      await expect(service.remove(wsId, userId)).rejects.toThrow(ForbiddenException);
    });
  });
});