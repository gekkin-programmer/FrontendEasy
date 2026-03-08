import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { EmailService } from '../../../common/providers/email/email.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // ➤ LIST MEMBERS
  async findAll(workspaceId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            status: true,
          },
        },
      },
      orderBy: { role: 'asc' },
    });
  }

  // ➤ INVITE MEMBER (Shadow User Logic)
  async invite(workspaceId: string, dto: InviteMemberDto, inviterId: string) {
    // 1. Permission Check
    await this.checkPermission(workspaceId, inviterId);

    // 2. Get Workspace Name (for email)
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });
    if (!workspace) throw new NotFoundException('Workspace not found');

    // 3. Check if user exists
    let user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    let isNewUser = false;

    // 4. Create Shadow User if not exists
    if (!user) {
      isNewUser = true;
      user = await this.prisma.user.create({
        data: {
          email: dto.email,
          status: 'INACTIVE', // Shadow status
          provider: 'email',
          firstName: 'Invited', // Placeholder
          accountType: 'PERSONAL',
        },
      });
    }

    // 5. Check duplicate membership
    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
    });
    if (existingMember)
      throw new ConflictException('User is already in this workspace');

    // 6. Add to Workspace
    await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: user.id,
        role: dto.role,
        status: 'INVITED',
        invitedBy: inviterId,
      },
    });

    // 7. Send Email
    // Simple Token: Base64 of JSON (In prod use JWT)
    const tokenPayload = JSON.stringify({ email: dto.email, workspaceId });
    const inviteToken = Buffer.from(tokenPayload).toString('base64');

    await this.emailService.sendInvite(
      dto.email,
      workspace.name,
      inviteToken,
      isNewUser,
    );

    return {
      message: 'Invitation sent',
      userStatus: isNewUser ? 'SHADOW_CREATED' : 'EXISTING_INVITED',
    };
  }

  // ➤ ACCEPT INVITE
  async acceptInvite(workspaceId: string, email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    // Activate Membership
    await this.prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId: user.id } },
      data: { status: 'ACTIVE', joinedAt: new Date() },
    });

    // Activate Shadow User if needed
    if (user.status === 'INACTIVE') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: 'ACTIVE' },
      });
    }

    return { message: 'Joined successfully' };
  }

  // ➤ UPDATE ROLE
  async updateRole(
    workspaceId: string,
    memberId: string,
    dto: UpdateRoleDto,
    requesterId: string,
  ) {
    await this.checkPermission(workspaceId, requesterId);
    return this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role: dto.role },
    });
  }

  // ➤ REMOVE MEMBER
  async remove(workspaceId: string, memberId: string, requesterId: string) {
    await this.checkPermission(workspaceId, requesterId);
    return this.prisma.workspaceMember.delete({ where: { id: memberId } });
  }

  // Helper
  private async checkPermission(workspaceId: string, userId: string) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
    if (!member || (member.role !== 'OWNER' && member.role !== 'ADMIN')) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
