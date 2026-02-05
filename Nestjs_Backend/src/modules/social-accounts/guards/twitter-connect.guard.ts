// src/modules/social-accounts/guards/twitter-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import pkceChallenge from 'pkce-challenge';

@Injectable()
export class TwitterConnectGuard extends AuthGuard('twitter-oauth2') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const { workspaceId, token } = req.query;

    if (workspaceId && token) {
        // 1. Generate Manual PKCE
        const pkce = await pkceChallenge();
        
        // 2. Save EVERYTHING in a signed cookie (more reliable than session on Render)
        const metadata = JSON.stringify({ 
            workspaceId, 
            token, 
            code_verifier: pkce.code_verifier 
        });

        res.cookie('twitter_oauth_state', metadata, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
            signed: true
        });

        // 3. Inject challenge into request so Strategy can use it
        req.query.code_challenge = pkce.code_challenge;
        console.log("🔹 Twitter Guard: Manual PKCE Generated & Cookie Set");
    }

    return (await super.canActivate(context)) as boolean;
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    return {
      codeChallenge: req.query.code_challenge,
      codeChallengeMethod: 'S256'
    };
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.error("❌ Twitter Auth Failed:", err);
      console.error("❌ Passport Info:", info); // Contains the specific OAuth error
      throw err || new Error("Twitter Authentication failed");
    }
    return user;
  }
}
