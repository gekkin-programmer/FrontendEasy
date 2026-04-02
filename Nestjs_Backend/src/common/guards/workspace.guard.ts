import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { WorkspaceMember } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface RequestWithUser extends Request<
  { workspaceId?: string },
  any,
  { workspaceId?: string }
> {
  user: {
    userId: string;
    sub: string;
    email: string;
    workspaceId?: string;
  };
  workspaceId: string;
  membership: WorkspaceMember;
}

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const workspaceId = request.params.workspaceId || request.body.workspaceId;

    if (!workspaceId) {
      throw new ForbiddenException('Workspace ID is required');
    }

    const membership = await this.prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId: user.sub,
        status: 'ACTIVE',
      },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // Attach workspace and membership to request
    request.workspaceId = workspaceId;
    request.membership = membership;

    return true;
  }
}
