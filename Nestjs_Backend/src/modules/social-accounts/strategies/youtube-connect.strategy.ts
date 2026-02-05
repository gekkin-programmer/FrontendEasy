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
      prompt: 'consent' // Forces consent screen to ensure we get Refresh Token
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    const payload = {
      platform: 'YOUTUBE',
      platformUserId: profile.id,
      name: profile.displayName,
      accessToken,
      refreshToken, // Store this securely! Google access tokens die in 1 hour.
      avatar: profile.photos?.[0]?.value,
    };
    done(null, payload);
  }
}