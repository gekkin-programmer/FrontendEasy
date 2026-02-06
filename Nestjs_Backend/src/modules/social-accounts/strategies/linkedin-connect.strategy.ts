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
      userProfileURL: 'https://api.linkedin.com/v2/userinfo', // ➤ REQUIRED for openid scope
      state: true, 
      passReqToCallback: true, 
    }as any);
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      console.log("🔹 LinkedIn OIDC Validate Triggered");
      console.log("🔹 LinkedIn Profile:", JSON.stringify(profile, null, 2));
      
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
        platformUserId: profile.id || profile.sub, // OIDC uses 'sub'
        name: profile.displayName || profile.name || 'LinkedIn User',
        avatar: profile.photos?.[0]?.value || profile.picture, // OIDC uses 'picture'
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
