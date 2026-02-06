import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-tiktok-auth';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class TikTokConnectStrategy extends PassportStrategy(Strategy, 'tiktok-connect') {
  private readonly logger = new Logger(TikTokConnectStrategy.name);

  constructor(configService: ConfigService, private authService: AuthService) {
    super({
      clientID: configService.get<string>('TIKTOK_CLIENT_KEY'),
      clientSecret: configService.get<string>('TIKTOK_CLIENT_SECRET'),
      callbackURL: configService.get<string>('TIKTOK_CALLBACK_URL') || `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/callback/tiktok`,
      scope: ['user.info.basic'],
      authorizationURL: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenURL: 'https://open.tiktokapis.com/v2/oauth/token/',
      userProfileURL: 'https://open.tiktokapis.com/v2/user/info/', 
      state: true,
      passReqToCallback: true,
    } as any);
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      this.logger.log("🔹 TikTok OAuth Validate Triggered");

      // Retrieve metadata from session
      const meta = req.session?.oauthMetadata;
      if (!meta) {
          this.logger.error("❌ TikTok Strategy: No metadata found in session");
          return done(new Error("Session lost: Missing workspace metadata"), false);
      }

      const { workspaceId, token: jwtToken } = meta;

      let userId;
      if (jwtToken) {
         const user = await this.authService.validateUserByToken(jwtToken);
         userId = user?.id;
      }

      const payload = {
        platform: 'TIKTOK',
        platformUserId: profile.id || profile.open_id,
        name: profile.displayName || profile.display_name || 'TikTok User',
        avatar: profile.avatar_url || profile._json?.avatar_url,
        workspaceId,
        userId,
        accessToken,
        refreshToken
      };
      done(null, payload);
    } catch (error) {
      this.logger.error(`TikTok Validation Failed: ${error.message}`);
      done(error, false);
    }
  }
}
