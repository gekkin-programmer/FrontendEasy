import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookConnectStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
        super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || 'fb_id_placeholder', // Fallback
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || 'fb_secret_placeholder',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:3000/callback',
      scope: [
        'email', 
        'pages_show_list', 
        'pages_read_engagement', 
        'pages_manage_posts',
        'pages_read_user_content'
      ],
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    // We strictly return the tokens and profile. 
    // We do NOT save to DB here yet, we pass it to the controller.
    const payload = {
      platform: 'FACEBOOK',
      platformUserId: profile.id,
      avatar: profile.photos?.[0]?.value || profile._json?.picture?.data?.url, 
      name: profile.displayName || 'Facebook User',
      accessToken,
      refreshToken,
    };
    done(null, payload);
  }
}