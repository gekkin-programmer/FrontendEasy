// src/modules/social-accounts/guards/tiktok-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TikTokConnectGuard extends AuthGuard('tiktok-connect') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    // Save metadata to session cookie (consistent with LinkedIn/Twitter)
    if (req.session && workspaceId && token) {
        req.session.oauthMetadata = { workspaceId, token };
        console.log("🔹 TikTok Guard: Metadata saved to session");
    }

    // If we are in the callback phase (no workspaceId in query) 
    // but we have it in session, we are good to go.
    if (!workspaceId && req.session?.oauthMetadata) {
        console.log("🔹 TikTok Guard: Continuing with existing session metadata");
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    return {
      scope: ['user.info.basic', 'video.list'],
      scopeSeparator: ',', // ➤ TikTok standard is comma
    };
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.error("❌ TikTok Auth Failed:", err);
      console.error("❌ Passport Info:", info); 
      throw err || new Error("TikTok Authentication failed");
    }
    return user;
  }
}