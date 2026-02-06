import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class LinkedInConnectStrategy extends PassportStrategy(Strategy, 'linkedin') {
  private readonly logger = new Logger(LinkedInConnectStrategy.name);

  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID: configService.get<string>('LINKEDIN_CLIENT_ID') || 'placeholder',
      clientSecret: configService.get<string>('LINKEDIN_CLIENT_SECRET') || 'placeholder',
      callbackURL: configService.get<string>('LINKEDIN_CALLBACK_URL') || `${configService.get<string>('API_URL') || 'https://easypostv2.onrender.com'}/api/social-accounts/callback/linkedin`,
      scope: ['openid', 'profile', 'email', 'w_member_social'],
      state: true,
      passReqToCallback: true,
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, results: any, done: Function) {
    try {
      this.logger.log("🔹 LinkedIn OIDC Flow (Manual) Triggered");

      // 1. Manually fetch profile using OIDC userinfo endpoint
      // This bypasses any legacy library defaults
      const { data: profile } = await axios.get('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      this.logger.debug(`🔹 LinkedIn Profile Data: ${JSON.stringify(profile)}`);

      // 2. Retrieve metadata from session (cookie-session)
      const meta = req.session?.oauthMetadata;
      if (!meta) {
          this.logger.error("❌ LinkedIn Strategy: No metadata found in session");
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
        platformUserId: profile.sub, // OIDC standard
        name: profile.name || 'LinkedIn User',
        avatar: profile.picture, // OIDC standard
        accessToken,
        refreshToken,
        workspaceId,
        userId
      };
      
      done(null, payload);
    } catch (error) {
      this.logger.error(`LinkedIn OIDC Validation Failed: ${error.message}`);
      done(error, false);
    }
  }
}