// src/modules/social-accounts/guards/youtube-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class YoutubeConnectGuard extends AuthGuard('youtube') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    if (req.session && workspaceId && token) {
      req.session.oauthMetadata = { workspaceId, token };
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    return {
      accessType: 'offline',
      prompt: 'consent',
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
      ],
    };
  }
}
