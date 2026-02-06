// src/modules/social-accounts/guards/twitter-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwitterConnectGuard extends AuthGuard('twitter-oauth2') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    // Save metadata to session cookie (consistent with LinkedIn)
    if (req.session && workspaceId && token) {
        req.session.oauthMetadata = { workspaceId, token };
        console.log("🔹 Twitter Guard: Metadata saved to session");
    }

    return (await super.canActivate(context)) as boolean;
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.error("❌ Twitter Auth Failed:", err);
      console.error("❌ Passport Info:", info); 
      throw err || new Error("Twitter Authentication failed");
    }
    return user;
  }
}