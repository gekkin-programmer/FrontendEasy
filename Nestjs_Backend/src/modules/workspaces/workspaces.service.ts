import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  ConflictException 
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspaces.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceRole, WorkspaceStatus } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private prisma: PrismaService) {}

  // ➤ CREATE
  async create(createWorkspaceDto: CreateWorkspaceDto, userId: string) {
    // 1. Generate unique slug
    const baseSlug = createWorkspaceDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // 2. Transaction: Create Workspace AND Add User as OWNER
    return this.prisma.workspace.create({
      data: {
        ...createWorkspaceDto,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
            status: 'ACTIVE',
          },
        },
      },
    });
  }

  // ➤ LIST ALL (My Workspaces)
  async findAll(userId: string) {
    return this.prisma.workspace.findMany({
      where: {
        members: {
          some: { userId }, // Only where I am a member
        },
        status: { not: 'INACTIVE' }, // Don't show deleted ones
      },
      include: {
        members: { include: { user: { select: { id: true, firstName: true, avatar: true } } } }, // Show who is in the team
        _count: { select: { socialAccounts: true, posts: true } } // Show stats
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ➤ GET ONE (Details)
  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        socialAccounts: true,
          members: { 
    include: { 
      user: { 
        select: { id: true, firstName: true, lastName: true, avatar: true, email: true } 
      } 
    } 
  },
      }
    });

    if (!workspace) throw new NotFoundException('Workspace not found');

    // Security: Check if user is a member
    const isMember = workspace.members.some(m => m.userId === userId);
    if (!isMember) throw new ForbiddenException('Access denied');

    return workspace;
  }

  // ➤ UPDATE
  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto, userId: string) {
    // 1. Check permissions
    await this.verifyAdminRole(id, userId);

    return this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
    });
  }

  // ➤ ARCHIVE (Soft Delete)
  async remove(id: string, userId: string) {
    // 1. Check permissions (Only Owner can delete)
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId } }
    });

    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException('Only the Owner can archive a workspace');
    }

    return this.prisma.workspace.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  // ➤ HELPER: Permission Check
  private async verifyAdminRole(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });

    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw new ForbiddenException('You must be an Admin or Owner to do this');
    }
  }

  // ➤ FOR TESTING ONLY: Manually set post count
  async setPostCount(workspaceId: string, count: number) {
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: { currentPostCount: count }
    });
  }
}