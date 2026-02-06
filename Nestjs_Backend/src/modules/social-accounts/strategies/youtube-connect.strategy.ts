import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class YoutubeConnectStrategy extends PassportStrategy(Strategy, 'youtube') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('YOUTUBE_CALLBACK_URL') || `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/callback/youtube`, 
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/youtube.upload', 
        'https://www.googleapis.com/auth/youtube.readonly' 
      ],
      accessType: 'offline',
      prompt: 'consent',
      state: true,
      passReqToCallback: true,
    } as any);
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      const meta = req.session?.oauthMetadata;
      const workspaceId = meta?.workspaceId;
      const jwtToken = meta?.token;

      let userId;
      if (jwtToken) {
         const user = await this.authService.validateUserByToken(jwtToken);
         userId = user?.id;
      }

      const payload = {
        platform: 'YOUTUBE',
        platformUserId: profile.id,
        name: profile.displayName,
        accessToken,
        refreshToken, 
        avatar: profile.photos?.[0]?.value,
        workspaceId,
        userId
      };
      done(null, payload);
    } catch (e) {
      done(e, false);
    }
  }
}
