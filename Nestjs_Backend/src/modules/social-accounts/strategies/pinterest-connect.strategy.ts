import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class PinterestConnectStrategy extends PassportStrategy(
  Strategy,
  'pinterest',
) {
  private readonly logger = new Logger(PinterestConnectStrategy.name);

  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://www.pinterest.com/oauth/',
      tokenURL: 'https://api.pinterest.com/v5/oauth/token',
      clientID:
        configService.get<string>('PINTEREST_APP_ID') || 'placeholder',
      clientSecret:
        configService.get<string>('PINTEREST_APP_SECRET') || 'placeholder',
      callbackURL:
        configService.get<string>('PINTEREST_CALLBACK_URL') ||
        `${configService.get<string>('API_URL') || 'http://localhost:3000'}/api/social-accounts/callback/pinterest`,
      scope: ['boards:read', 'pins:read', 'pins:write', 'user_accounts:read'],
      scopeSeparator: ',',
      state: true,
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    _results: any,
    done: Function,
  ) {
    try {
      this.logger.log('🔹 Pinterest OAuth 2.0 Triggered');

      const { data: profile } = await axios.get(
        'https://api.pinterest.com/v5/user_account',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      this.logger.debug(`🔹 Pinterest Profile: ${JSON.stringify(profile)}`);

      const meta = req.session?.oauthMetadata;
      if (!meta) {
        this.logger.error('❌ Pinterest Strategy: No metadata in session');
        return done(new Error('Session lost: Missing workspace metadata'), false);
      }

      const { workspaceId, token: jwtToken } = meta;

      let userId: string | undefined;
      if (jwtToken) {
        const user = await this.authService.validateUserByToken(jwtToken);
        userId = user?.id;
      }

      if (!userId) {
        return done(new Error('User session lost during Pinterest OAuth'), false);
      }

      done(null, {
        platform: 'PINTEREST',
        platformUserId: profile.username,
        name: profile.username || 'Pinterest User',
        avatar: profile.profile_image || null,
        accessToken,
        refreshToken,
        workspaceId,
        userId,
      });
    } catch (error) {
      const msg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(`Pinterest OAuth Validation Failed: ${msg}`);
      done(error, false);
    }
  }
}
