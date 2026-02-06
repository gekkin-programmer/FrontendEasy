import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TikTokConnectGuard extends AuthGuard('tiktok-connect') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    if (req.session && workspaceId && token) {
        req.session.oauthMetadata = { workspaceId, token };
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    return {
      scope: ['user.info.basic'],
    };
  }
}
