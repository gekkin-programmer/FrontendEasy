// src/modules/social-accounts/guards/youtube-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class YoutubeConnectGuard extends AuthGuard('youtube') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    return {
      // Pass our metadata securely via the 'state' param
      state: JSON.stringify({ workspaceId, token }),
      
      // CRITICAL FOR YOUTUBE:
      accessType: 'offline', // Request Refresh Token
      prompt: 'consent',     
      scope: [
        'email', 
        'profile', 
        'https://www.googleapis.com/auth/youtube.upload', 
        'https://www.googleapis.com/auth/youtube.readonly' 
      ]
    };
  }
}