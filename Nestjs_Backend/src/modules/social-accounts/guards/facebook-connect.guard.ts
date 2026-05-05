// src/modules/social-accounts/guards/facebook-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookConnectGuard extends AuthGuard('facebook') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;
    const isInstagram = req.path.includes('instagram');

    // Save metadata to session cookie (robust & stateless)
    if (req.session && workspaceId && token) {
      req.session.oauthMetadata = {
        workspaceId,
        token,
        platform: isInstagram ? 'INSTAGRAM' : 'FACEBOOK',
      };
      console.log('🔹 Facebook Guard: Metadata saved to session');
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    return {
      scope: [
        'email',
        'public_profile',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_posts',
        'instagram_basic',
        'instagram_content_publish',
      ],
      // reauth=true skips auth_type:rerequest so Facebook shows full fresh consent
      reauth: req.query.reauth === 'true',
    };
  }
}
