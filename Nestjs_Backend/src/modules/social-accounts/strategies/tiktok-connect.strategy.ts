import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-tiktok-auth';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TikTokConnectStrategy extends PassportStrategy(Strategy, 'tiktok-connect') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('TIKTOK_CLIENT_KEY'),
      clientSecret: configService.get<string>('TIKTOK_CLIENT_SECRET'),
      callbackURL: configService.get<string>('TIKTOK_CALLBACK_URL') || `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/callback/tiktok`,
      scope: ['user.info.basic'],
      authorizationURL: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenURL: 'https://open.tiktokapis.com/v2/oauth/token/',
      userProfileURL: 'https://open.tiktokapis.com/v2/user/info/', 
      state: false,
      passReqToCallback: true,
    } as any);
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      let state = {};
      if (req.query.state) {
          try {
            state = JSON.parse(req.query.state as string);
          } catch(e) {}
      }
      const { workspaceId } = state as any;

      const payload = {
        platform: 'TIKTOK',
        platformUserId: profile.id,
        name: profile.displayName || profile.username,
        accessToken,
        refreshToken, 
        avatar: profile._json?.avatar_url,
        workspaceId,
      };
      done(null, payload);
    } catch (e) {
      done(e, false);
    }
  }
}