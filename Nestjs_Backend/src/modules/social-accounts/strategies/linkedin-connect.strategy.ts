import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class LinkedInConnectStrategy extends PassportStrategy(Strategy, 'linkedin') { // Standard name 'linkedin' is better
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET') || 'placeholder',
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL') || `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/callback/linkedin`,
      scope: ['openid', 'profile', 'email', 'w_member_social'], 
      state: false, // ➤ Disable session-based state for stateless API
      passReqToCallback: true, // ➤ CRITICAL: To read req.query.state
    }as any);
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      // 1. Decode State
      let state = {};
      if (req.query.state) {
          try {
            state = JSON.parse(req.query.state as string);
          } catch(e) {}
      }
      const { workspaceId, token, userId: stateUserId } = state as any;

      // 2. Resolve User ID
      let userId = stateUserId;
      if (!userId && token) {
         const user = await this.authService.validateUserByToken(token);
         userId = user?.id;
      }

      if (!userId) {
          return done(new Error("User session lost during LinkedIn OAuth"), false);
      }

      const payload = {
        platform: 'LINKEDIN',
        platformUserId: profile.id, 
        name: profile.displayName || 'LinkedIn User',
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