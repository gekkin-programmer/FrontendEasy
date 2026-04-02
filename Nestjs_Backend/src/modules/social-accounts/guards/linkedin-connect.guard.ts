// src/modules/social-accounts/guards/linkedin-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LinkedInConnectGuard extends AuthGuard('linkedin') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    // Save metadata to session cookie (robust & stateless)
    if (req.session && workspaceId && token) {
      req.session.oauthMetadata = { workspaceId, token };
      console.log('🔹 LinkedIn Guard: Metadata saved to session');
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(_context: ExecutionContext) {
    return {
      scope: ['openid', 'profile', 'email', 'w_member_social'],
    };
  }
}
