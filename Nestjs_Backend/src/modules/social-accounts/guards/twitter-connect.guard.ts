// src/modules/social-accounts/guards/twitter-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwitterConnectGuard extends AuthGuard('twitter-oauth2') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { workspaceId, token } = req.query;

    // 1. We ONLY save our metadata in a signed cookie.
    // We let Passport handle the 'state' and 'pkce' automatically via session.
    if (workspaceId && token) {
        res.cookie('twitter_meta', JSON.stringify({ workspaceId, token }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000, 
            signed: true
        });
        console.log("🔹 Twitter Guard: Metadata saved to signed cookie 'twitter_meta'");
    }

    return (await super.canActivate(context)) as boolean;
  }

  // We return nothing to let Passport use its internal automatic state/PKCE
  getAuthenticateOptions(context: ExecutionContext) {
    return {};
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