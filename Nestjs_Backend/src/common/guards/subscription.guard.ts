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
    const request = context.switchToHttp().getRequest<{
      user?: { sub?: string; id?: string };
      body: { workspaceId?: string };
      query: { workspaceId?: string };
    }>();
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
      // POST LIMIT: 10
      if (workspace.currentPostCount >= 10) {
        throw new ForbiddenException(
          '🎉 Passez à STARTER pour seulement 4,900 FCFA/mois -> 100 posts, 5 comptes, 100 AI requests',
        );
      }

      // SOCIAL ACCOUNT LIMIT: 2
      if (workspace.currentSocialAccountCount >= 2) {
        throw new ForbiddenException(
          '🎉 Passez à STARTER pour seulement 4,900 FCFA/mois -> Ajoutez TikTok & LinkedIn (5 comptes)',
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
