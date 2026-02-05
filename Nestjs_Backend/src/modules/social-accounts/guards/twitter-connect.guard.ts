// src/modules/social-accounts/guards/twitter-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwitterConnectGuard extends AuthGuard('twitter-oauth2') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    // Store metadata in session to retrieve it in the strategy later
    // avoiding conflicts with Passport's internal PKCE state management.
    if (req.session) {
        req.session.twitterMetadata = { workspaceId, token };
        console.log("🔹 Twitter Guard: Metadata saved to session", req.session.twitterMetadata);
    } else {
        console.error("❌ Twitter Guard: No session found!");
    }

    const result = (await super.canActivate(context)) as boolean;
    return result;
  }

  // Remove getAuthenticateOptions override to let Passport handle state/PKCE automatically
  
  handleRequest(err, user, info) {
    if (err || !user) {
      console.error("❌ Twitter Auth Failed:", err);
      console.error("❌ Passport Info:", info); // Contains the specific OAuth error
      throw err || new Error("Twitter Authentication failed");
    }
    return user;
  }
}