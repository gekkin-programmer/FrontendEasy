import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkedInConnectStrategy extends PassportStrategy(Strategy, 'linkedin-connect') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET') || 'placeholder',
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL'),
      scope: ['openid', 'profile', 'email', 'w_member_social'], 
      state: false, 
      
      
      skipUserProfile: true, 
    } as any);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    // Since we skipped profile, we construct a dummy one or fetch manually if needed.
    // For MVP posting, we only need the TOKEN.
    
    // Note: To get the name/avatar, you would need a manual axios call to /v2/userinfo here.
    // But let's keep it simple to unblock you.
    
    const payload = {
      platform: 'LINKEDIN',
      platformUserId: 'linkedin_user', 
      name: 'LinkedIn User',
      accessToken,
      refreshToken,
      email: null,
      avatar: null,
    };
    done(null, payload);
  }
}