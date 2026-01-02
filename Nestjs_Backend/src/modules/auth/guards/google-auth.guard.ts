import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const result = (await super.canActivate(context)) as boolean;
    
    // Store the workspaceId if provided in query params
    if (request.query.workspaceId) {
      request.session.workspaceId = request.query.workspaceId;
    }
    
    await super.logIn(request);
    return result;
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      throw err || new Error('Google authentication failed');
    }
    return user;
  }
}