import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class TwitterConnectStrategy extends PassportStrategy(Strategy, 'twitter') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      consumerKey: configService.get<string>('TWITTER_API_KEY') || 'placeholder',
      consumerSecret: configService.get<string>('TWITTER_API_SECRET') || 'placeholder',
      callbackURL: `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/twitter/callback`,
      passReqToCallback: true,
    });
  }

  async validate(req: any, token: string, tokenSecret: string, profile: any, done: Function) {
    try {
      // Twitter OAuth 1.0a uses 'state' differently, usually via session
      // For this implementation we'll try to extract from query if possible
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
        accessToken: token,
        refreshToken: tokenSecret, // In OAuth 1.0a, tokenSecret is stored as refreshToken
        workspaceId,
        userId
      };
      done(null, payload);
    } catch (error) {
      done(error, false);
    }
  }
}