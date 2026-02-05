import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class TwitterConnectStrategy extends PassportStrategy(Strategy, 'twitter-oauth2') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('TWITTER_API_KEY') || 'placeholder',
      clientSecret: configService.get<string>('TWITTER_API_SECRET') || 'placeholder',
      callbackURL: configService.get<string>('TWITTER_CALLBACK_URL') || `${configService.get<string>('API_URL') || 'https://easypostv2.onrender.com'}/api/social-accounts/callback/twitter`,
      authorizationURL: 'https://twitter.com/i/oauth2/authorize',
      tokenURL: 'https://api.twitter.com/2/oauth2/token',
      clientType: 'confidential',
      pkce: true, 
      state: true, 
      passReqToCallback: true,
      skipUserProfile: false,
      scope: [
        'tweet.read',
        'tweet.write',
        'users.read',
        'offline.access',
        'dm.read',
        'dm.write'
      ],
      scopeSeparator: ' ', // ➤ CRITICAL: X requires spaces, not commas
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      console.log("🔹 Twitter OAuth 2.0 Validate Triggered");
      console.log("🔹 Profile:", JSON.stringify(profile, null, 2));
      
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