import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class TikTokConnectStrategy extends PassportStrategy(Strategy, 'tiktok-connect') {
  private readonly logger = new Logger(TikTokConnectStrategy.name);

  constructor(
    private configService: ConfigService, 
    private authService: AuthService
  ) {
    const clientKey = configService.get<string>('TIKTOK_CLIENT_KEY');
    const clientSecret = configService.get<string>('TIKTOK_CLIENT_SECRET');

    super({
      authorizationURL: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenURL: 'https://open.tiktokapis.com/v2/oauth/token/',
      clientID: clientKey || 'placeholder',
      clientSecret: clientSecret || 'placeholder',
      callbackURL: configService.get<string>('TIKTOK_CALLBACK_URL') || `${configService.get<string>('API_URL') || 'https://backend-eazypost.mbokofit.com'}/api/social-accounts/callback/tiktok`,
      scope: ['user.info.basic', 'video.list'],
      scopeSeparator: ',',
      state: true,
      passReqToCallback: true,
    });

    const key = configService.get<string>('TIKTOK_CLIENT_KEY');
    const secret = configService.get<string>('TIKTOK_CLIENT_SECRET');
    console.log(`🔹 TikTok Strategy Init: Key=${key ? key.substring(0,4)+'***' : 'MISSING'}, Secret=${secret ? 'PRESENT' : 'MISSING'}`);
  }

  // ➤ CRITICAL: TikTok V2 requires 'client_key' instead of 'client_id' in the URL
  authorizationParams(options: any): any {
    return {
      client_key: this.configService.get<string>('TIKTOK_CLIENT_KEY'),
    };
  }

  // ➤ CRITICAL: TikTok V2 also requires 'client_key' and 'client_secret' in the token request body
  tokenParams(options: any): any {
    return {
      client_key: this.configService.get<string>('TIKTOK_CLIENT_KEY'),
      client_secret: this.configService.get<string>('TIKTOK_CLIENT_SECRET'),
    };
  }

  async validate(req: any, accessToken: string, refreshToken: string, results: any, done: Function) {
    try {
      this.logger.log("🔹 TikTok OIDC Flow (Manual) Triggered");

      // 1. Manually fetch profile using authorized fields ONLY
      // In Sandbox mode, we request the bare minimum to ensure authorization passes
      const profileRes = await axios.get('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const profile = profileRes.data?.data?.user;
      
      if (!profile) {
          this.logger.error("❌ TikTok Strategy: Failed to extract user profile from response", profileRes.data);
          return done(new Error("Could not retrieve TikTok profile"), false);
      }

      this.logger.debug(`🔹 TikTok Profile Data: ${JSON.stringify(profile)}`);

      // 2. Retrieve metadata from session
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

      if (!userId) {
          return done(new Error("User session lost during TikTok OAuth"), false);
      }

      const payload = {
        platform: 'TIKTOK',
        platformUserId: profile.open_id,
        name: profile.display_name || 'TikTok User',
        avatar: profile.avatar_url,
        workspaceId,
        userId,
        accessToken,
        refreshToken
      };
      
      done(null, payload);
    } catch (error) {
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      this.logger.error(`TikTok OIDC Validation Failed: ${errorMsg}`);
      done(error, false);
    }
  }
}