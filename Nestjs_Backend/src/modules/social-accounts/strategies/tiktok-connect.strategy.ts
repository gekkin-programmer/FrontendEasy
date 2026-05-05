import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class TikTokConnectStrategy extends PassportStrategy(
  Strategy,
  'tiktok-connect',
) {
  private readonly logger = new Logger(TikTokConnectStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    const clientKey = configService.get<string>('TIKTOK_CLIENT_KEY');
    const clientSecret = configService.get<string>('TIKTOK_CLIENT_SECRET');

    super({
      authorizationURL: 'https://www.tiktok.com/v2/auth/authorize/',
      tokenURL: 'https://open.tiktokapis.com/v2/oauth/token/',
      clientID: clientKey || 'placeholder',
      clientSecret: clientSecret || 'placeholder',
      callbackURL:
        configService.get<string>('TIKTOK_CALLBACK_URL') ||
        `${configService.get<string>('API_URL') || 'https://easypostv2.onrender.com'}/api/social-accounts/callback/tiktok`,
      scope: ['user.info.basic', 'user.info.profile', 'user.info.stats', 'video.publish', 'video.upload'],
      scopeSeparator: ',',
      state: true,
      passReqToCallback: true,
    });

    const key = configService.get<string>('TIKTOK_CLIENT_KEY');
    const secret = configService.get<string>('TIKTOK_CLIENT_SECRET');
    console.log(
      `🔹 TikTok Strategy Init: Key=${key ? key.substring(0, 4) + '***' : 'MISSING'}, Secret=${secret ? 'PRESENT' : 'MISSING'}`,
    );
  }

  // ➤ CRITICAL: TikTok V2 requires 'client_key' instead of 'client_id' in the URL
  // force_auth=true ensures TikTok shows the consent screen even if the user
  // previously authorized, so new scopes (e.g. video.publish) are always granted.
  authorizationParams(_options: any): any {
    return {
      client_key: this.configService.get<string>('TIKTOK_CLIENT_KEY'),
      force_auth: 'true',
    };
  }

  // ➤ CRITICAL: TikTok V2 also requires 'client_key' and 'client_secret' in the token request body
  tokenParams(_options: any): any {
    return {
      client_key: this.configService.get<string>('TIKTOK_CLIENT_KEY'),
      client_secret: this.configService.get<string>('TIKTOK_CLIENT_SECRET'),
    };
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    _results: any,
  ): Promise<any> {
    try {
      this.logger.log('🔹 TikTok OIDC Flow (Manual) Triggered');

      const profileRes = await axios.get(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const profile = profileRes.data?.data?.user;
      if (!profile) {
        throw new Error('Could not retrieve TikTok profile');
      }

      this.logger.debug(`🔹 TikTok Profile Data: ${JSON.stringify(profile)}`);

      const meta = req.session?.oauthMetadata;
      if (!meta) {
        throw new Error('Session lost: Missing workspace metadata');
      }

      const { workspaceId, token: jwtToken } = meta;
      const user = await this.authService.validateUserByToken(jwtToken);
      const userId = user?.id;

      if (!userId) {
        throw new Error('User session lost during TikTok OAuth');
      }

      return {
        platform: 'TIKTOK',
        platformUserId: profile.open_id,
        name: profile.display_name || 'TikTok User',
        avatar: profile.avatar_url,
        workspaceId,
        userId,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      const errorMsg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(`TikTok OIDC Validation Failed: ${errorMsg}`);
      throw error;
    }
  }
}
