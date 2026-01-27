// src/modules/social-accounts/guards/twitter-connect.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class TwitterConnectGuard extends AuthGuard('twitter') {
  // Twitter OAuth 1.0a is stricter and handles 'state' differently (often via session),
  // but Passport usually handles the redirect logic automatically.
  // We can inject query params if the strategy supports it, but standard 1.0a relies on the callback URL itself.
}