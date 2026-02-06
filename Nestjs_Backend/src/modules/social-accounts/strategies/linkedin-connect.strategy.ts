import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class LinkedInConnectStrategy extends PassportStrategy(Strategy, 'linkedin') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET') || 'placeholder',
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL') || `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/callback/linkedin`,
      scope: ['openid', 'profile', 'email', 'w_member_social'], 
      state: true, // ➤ Standard automatic handling
      passReqToCallback: true, 
    }as any);
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      console.log("🔹 LinkedIn OAuth Validate Triggered");
      
      // Retrieve metadata from session
      const meta = req.session?.oauthMetadata;
      if (!meta) {
          console.error("❌ LinkedIn Strategy: No metadata found in session");
          return done(new Error("Session lost: Missing workspace metadata"), false);
      }

      const { workspaceId, token: jwtToken } = meta;

      let userId;
      if (jwtToken) {
         const user = await this.authService.validateUserByToken(jwtToken);
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
