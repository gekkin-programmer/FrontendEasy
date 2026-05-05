import { Injectable, Logger, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwitterConnectGuard extends AuthGuard('twitter-oauth2') {
  private readonly logger = new Logger(TwitterConnectGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    if (req.session && workspaceId && token) {
      req.session.oauthMetadata = { workspaceId, token };
      this.logger.log('Twitter Guard: session metadata saved');
    } else if (!workspaceId && req.session?.oauthMetadata) {
      this.logger.log('Twitter Guard: resuming from existing session metadata');
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      this.logger.error(`Twitter Auth error: ${err.message}`);
      throw err;
    }
    if (!user) {
      this.logger.error(`Twitter Auth failed — no user. Info: ${JSON.stringify(info)}`);
      throw new UnauthorizedException('Twitter authentication failed');
    }
    return user;
  }
}
