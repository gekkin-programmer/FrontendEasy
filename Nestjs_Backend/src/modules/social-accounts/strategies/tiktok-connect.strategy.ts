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
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const payload = {
      platform: 'TIKTOK',
      platformUserId: profile.id,
      name: profile.displayName || profile.username,
      accessToken,
      refreshToken, 
      avatar: profile._json?.avatar_url,
    };
    done(null, payload);
  }
}