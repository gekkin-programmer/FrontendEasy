import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class YoutubeConnectStrategy extends PassportStrategy(Strategy, 'youtube-connect') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('YOUTUBE_CALLBACK_URL') || `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/callback/youtube`, 
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/youtube.upload', // Upload videos
        'https://www.googleapis.com/auth/youtube.readonly' // Read stats
      ],
      accessType: 'offline', // Critical: Gives us a Refresh Token
      prompt: 'consent', // Forces consent screen to ensure we get Refresh Token
      state: false,
      passReqToCallback: true,
    } as any);
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      let state = {};
      if (req.query.state) {
          try {
            const decodedState = Buffer.from(req.query.state as string, 'base64').toString();
            state = JSON.parse(decodedState);
          } catch(e) {}
      }
      const { workspaceId } = state as any;

      const payload = {
        platform: 'YOUTUBE',
        platformUserId: profile.id,
        name: profile.displayName,
        accessToken,
        refreshToken, 
        avatar: profile.photos?.[0]?.value,
        workspaceId,
      };
      done(null, payload);
    } catch (e) {
      done(e, false);
    }
  }
}