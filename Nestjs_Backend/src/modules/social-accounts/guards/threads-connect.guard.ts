import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ThreadsConnectGuard extends AuthGuard('threads') {
  private readonly logger = new Logger(ThreadsConnectGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;
    const isCallback = req.path?.includes('/callback/');

    this.logger.log(`[Threads] ${isCallback ? 'CALLBACK' : 'CONNECT'} — path=${req.path} sessionId=${req.sessionID ?? 'none'}`);

    if (!isCallback && workspaceId && token) {
      req.session.oauthMetadata = { workspaceId, token };
      await new Promise<void>((resolve, reject) =>
        req.session.save((err: any) => (err ? reject(err) : resolve()))
      );
      this.logger.log(`[Threads] session saved — workspaceId=${workspaceId as string} sessionId=${req.sessionID}`);
    }

    if (isCallback) {
      const meta = req.session?.oauthMetadata;
      this.logger.log(`[Threads] callback session meta: ${meta ? JSON.stringify(meta) : 'MISSING — session lost'}`);
      this.logger.log(`[Threads] cookies: ${JSON.stringify(req.headers?.cookie ?? 'none')}`);
    }

    return (await super.canActivate(context)) as boolean;
  }
}
