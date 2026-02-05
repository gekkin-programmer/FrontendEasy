// src/modules/social-accounts/guards/twitter-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwitterConnectGuard extends AuthGuard('twitter-oauth2') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const { workspaceId, token } = req.query;

    return {
      // Base64 encode to prevent JSON corruption in URL
      state: Buffer.from(JSON.stringify({ workspaceId, token: String(token) })).toString('base64'),
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