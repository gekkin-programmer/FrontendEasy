import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PlanType } from '@prisma/client';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub || request.user?.id;

    if (!userId) return false;

    // 1. Resolve Workspace ID (from body, query, or user's first workspace)
    const workspaceId = 
      request.body.workspaceId || 
      request.query.workspaceId || 
      (await this.getDefaultWorkspaceId(userId));

    if (!workspaceId) {
      throw new ForbiddenException('No workspace context found');
    }

    // 2. Get Workspace and Plan
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: { owner: true },
    });

    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    // Check plan from owner or specific subscription record
    // Using user.planType as defined in schema.prisma
    const plan = workspace.owner.planType;

    // 3. Enforcement Logic
    if (plan === PlanType.FREE) {
      if (workspace.currentPostCount >= 10) {
        throw new ForbiddenException(
          'Monthly limit reached. Please upgrade to PRO to create more posts.',
        );
      }
    }

    return true;
  }

  private async getDefaultWorkspaceId(userId: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { ownedWorkspaces: { take: 1 } },
    });
    return user?.ownedWorkspaces[0]?.id || null;
  }
}
