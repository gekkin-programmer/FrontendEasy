import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class SnapchatConnectGuard extends AuthGuard('snapchat') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    if (req.session && workspaceId && token) {
      req.session.oauthMetadata = { workspaceId, token };
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.error('❌ Snapchat Auth Failed:', err);
      console.error('❌ Passport Info:', info);
      throw err || new Error('Snapchat Authentication failed');
    }
    return user;
  }
}
