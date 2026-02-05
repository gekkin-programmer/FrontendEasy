// src/modules/social-accounts/guards/twitter-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwitterConnectGuard extends AuthGuard('twitter') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    return {
      // Pass metadata manually via state
      state: JSON.stringify({ workspaceId, token }),
    };
  }
}