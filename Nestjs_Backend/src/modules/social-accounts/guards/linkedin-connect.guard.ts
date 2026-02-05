// src/modules/social-accounts/guards/linkedin-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class LinkedInConnectGuard extends AuthGuard('linkedin') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    return {
      state: Buffer.from(JSON.stringify({ workspaceId, token })).toString('base64'),
      scope: ['openid', 'profile', 'email', 'w_member_social'],
    };
  }
}