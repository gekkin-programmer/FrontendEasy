import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class InstagramBusinessConnectGuard extends AuthGuard(
  'instagram-business',
) {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    if (req.session && workspaceId && token) {
      req.session.oauthMetadata = {
        workspaceId,
        token,
        platform: 'INSTAGRAM',
      };
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(_context: ExecutionContext) {
    return {
      scope: [
        'instagram_business_basic',
        'instagram_business_content_publish',
        'instagram_business_manage_comments',
        'instagram_business_manage_insights',
      ],
    };
  }
}
