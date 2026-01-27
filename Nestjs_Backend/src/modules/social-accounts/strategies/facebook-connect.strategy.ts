import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class FacebookConnectStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || 'fb_id_placeholder',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || 'fb_secret_placeholder',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:3000/callback',
      
      // ➤ CRITICAL: Must be true to read 'state'
      passReqToCallback: true, 
      
      scope: [
        'email', 
        'pages_show_list', 
        'pages_read_engagement', 
        'pages_manage_posts',
        'pages_read_user_content',
        'instagram_basic',           // Required for Instagram
        'instagram_content_publish'  // Required for Instagram
      ],
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    });
  }

  // ➤ Updated validate signature to include 'req'
  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      // 1. Decode State to get Metadata (Passed from Guard)
      // The state might be undefined if CSRF failed, handle gracefully
      let state = {};
      if (req.query.state) {
          try {
            state = JSON.parse(req.query.state as string);
          } catch(e) {
            console.warn("Could not parse OAuth state", req.query.state);
          }
      }
      
      const { workspaceId, token, userId: stateUserId } = state as any;

      // 2. Resolve User ID (Either from State or JWT Token in State)
      let userId = stateUserId;
      if (!userId && token) {
         const user = await this.authService.validateUserByToken(token);
         userId = user?.id;
      }

      if (!userId) {
          // If we can't find the user, we can't link the account.
          return done(new Error("User session lost during OAuth"), false);
      }

      const payload = {
        platform: 'FACEBOOK',
        platformUserId: profile.id,
        avatar: profile.photos?.[0]?.value || profile._json?.picture?.data?.url, 
        name: profile.displayName || 'Facebook User',
        accessToken,
        refreshToken,
        // ➤ Pass these to controller/service
        workspaceId, 
        userId 
      };
      
      done(null, payload);
    } catch (error) {
      done(error, false);
    }
  }
}