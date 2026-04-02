import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailService } from '../../../common/providers/email/email.service';
import { ForbiddenException } from '@nestjs/common';

describe('MembersService - MVP Tests', () => {
  let service: MembersService;

  const mockPrismaService = {
    workspaceMember: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    workspace: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEmailService = {
    sendInvite: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('invite', () => {
    const dto = { email: 'new@example.com', role: 'MEMBER' as any };
    const workspaceId = 'ws-1';
    const inviterId = 'owner-1';

    it('should invite member via email and send invitation email', async () => {
      // 1. Permission check mocks
      mockPrismaService.workspaceMember.findUnique.mockResolvedValueOnce({
        role: 'OWNER',
      });
      mockPrismaService.workspace.findUnique.mockResolvedValue({
        id: workspaceId,
        name: 'Test Workspace',
      });

      // 2. User exists check mock
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null); // Shadow user logic
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-new',
        email: dto.email,
      });

      // 3. Duplicate check mock
      mockPrismaService.workspaceMember.findUnique.mockResolvedValueOnce(null);

      mockPrismaService.workspaceMember.create.mockResolvedValue({
        id: 'mem-1',
      });
      mockEmailService.sendInvite.mockResolvedValue(true);

      const result = await service.invite(workspaceId, dto, inviterId);

      expect(result.message).toBe('Invitation sent');
      expect(mockEmailService.sendInvite).toHaveBeenCalled();
      expect(mockPrismaService.workspaceMember.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: dto.role }),
        }),
      );
    });

    it('should prevent non-admin from inviting', async () => {
      mockPrismaService.workspaceMember.findUnique.mockResolvedValueOnce({
        role: 'VIEWER',
      });
      await expect(service.invite(workspaceId, dto, inviterId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('list and update', () => {
    it('should list workspace members', async () => {
      mockPrismaService.workspaceMember.findMany.mockResolvedValue([
        { id: 'm1' },
        { id: 'm2' },
      ]);
      const result = await service.findAll('ws-1');
      expect(result).toHaveLength(2);
    });

    it('should update member role (admin only)', async () => {
      // Requester permission check
      mockPrismaService.workspaceMember.findUnique.mockResolvedValueOnce({
        role: 'ADMIN',
      });
      mockPrismaService.workspaceMember.update.mockResolvedValue({
        id: 'm1',
        role: 'ADMIN',
      });

      const result = await service.updateRole(
        'ws-1',
        'm1',
        { role: 'ADMIN' as any },
        'admin-id',
      );
      expect(result.role).toBe('ADMIN');
    });

    it('should remove member (admin only)', async () => {
      mockPrismaService.workspaceMember.findUnique.mockResolvedValueOnce({
        role: 'OWNER',
      });
      mockPrismaService.workspaceMember.delete.mockResolvedValue({ id: 'm1' });

      await service.remove('ws-1', 'm1', 'owner-id');
      expect(mockPrismaService.workspaceMember.delete).toHaveBeenCalled();
    });
  });
});
