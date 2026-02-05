import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class TwitterConnectStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('TWITTER_API_KEY') || 'placeholder',
      clientSecret: configService.get<string>('TWITTER_API_SECRET') || 'placeholder',
      callbackURL: configService.get<string>('TWITTER_CALLBACK_URL') || `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/callback/twitter`,
      clientType: 'confidential',
      pkce: true, // X OAuth 2.0 requires PKCE
      state: false, // ➤ CRITICAL: Disable session-based state management
      passReqToCallback: true,
      scope: [
        'tweet.read',
        'tweet.write',
        'users.read',
        'offline.access',
        'direct_messages.read',
        'direct_messages.write'
      ],
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      let state = {};
      if (req.query.state) {
          try {
            state = JSON.parse(req.query.state as string);
          } catch(e) {}
      }
      const { workspaceId, token: jwtToken } = state as any;

      let userId;
      if (jwtToken) {
         const user = await this.authService.validateUserByToken(jwtToken);
         userId = user?.id;
      }

      const payload = {
        platform: 'TWITTER',
        platformUserId: profile.id,
        name: profile.displayName || profile.username,
        avatar: profile.photos?.[0]?.value,
        accessToken,
        refreshToken, 
        workspaceId,
        userId
      };
      done(null, payload);
    } catch (error) {
      done(error, false);
    }
  }
}