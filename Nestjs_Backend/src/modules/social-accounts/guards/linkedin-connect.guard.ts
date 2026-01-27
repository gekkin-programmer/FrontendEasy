// src/modules/social-accounts/guards/linkedin-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class LinkedInConnectGuard extends AuthGuard('linkedin') {
  
  // ➤ ADD THIS: Critical for passing workspaceId to the callback
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    return {
      state: JSON.stringify({ workspaceId, token }),
      scope: ['openid', 'profile', 'email', 'w_member_social'],
    };
  }
}