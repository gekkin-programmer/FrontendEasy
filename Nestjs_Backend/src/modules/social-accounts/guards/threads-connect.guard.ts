import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ThreadsConnectGuard extends AuthGuard('threads') {
  private readonly logger = new Logger(ThreadsConnectGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    // Save metadata to session cookie (robust & stateless)
    if (req.session && workspaceId && token) {
      req.session.oauthMetadata = { workspaceId, token };
      this.logger.debug('Metadata saved to session');
    }

    return (await super.canActivate(context)) as boolean;
  }
}
