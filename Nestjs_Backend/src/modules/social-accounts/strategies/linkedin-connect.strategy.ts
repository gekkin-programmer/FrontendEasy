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
      
      // 1. Use the new scopes
      scope: ['openid', 'profile', 'email', 'w_member_social'],
      
      state: false,
      
      issuer: 'https://www.linkedin.com',
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      userProfileURL: 'https://api.linkedin.com/v2/userinfo', 

    } as any);
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const payload = {
      platform: 'LINKEDIN',
      platformUserId: profile.id,
      name: profile.displayName || profile.name?.givenName || 'LinkedIn User',
      accessToken,
      refreshToken,
      email: profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value || profile.picture, 
    };
    done(null, payload);
  }
}