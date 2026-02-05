import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TikTokConnectGuard extends AuthGuard('tiktok-connect') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    return {
      state: JSON.stringify({ workspaceId, token }),
      scope: ['user.info.basic'],
    };
  }
}