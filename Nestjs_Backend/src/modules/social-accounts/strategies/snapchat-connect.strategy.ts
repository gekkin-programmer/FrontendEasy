import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class SnapchatConnectStrategy extends PassportStrategy(
  Strategy,
  'snapchat',
) {
  private readonly logger = new Logger(SnapchatConnectStrategy.name);

  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://accounts.snapchat.com/accounts/oauth2/auth',
      tokenURL: 'https://accounts.snapchat.com/accounts/oauth2/token',
      clientID:
        configService.get<string>('SNAPCHAT_CLIENT_ID') || 'placeholder',
      clientSecret:
        configService.get<string>('SNAPCHAT_CLIENT_SECRET') || 'placeholder',
      callbackURL:
        configService.get<string>('SNAPCHAT_CALLBACK_URL') ||
        `${configService.get<string>('API_URL') || 'http://localhost:3000'}/api/social-accounts/callback/snapchat`,
      scope: [
        'https://auth.snapchat.com/oauth2/api/user.display_name',
        'https://auth.snapchat.com/oauth2/api/user.bitmoji.avatar',
      ],
      scopeSeparator: ' ',
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
      this.logger.log('🔹 Snapchat OAuth 2.0 Triggered');

      const { data: profile } = await axios.post(
        'https://kit.snapchat.com/v1/me',
        { query: '{ me { externalId displayName bitmoji { avatar } } }' },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const me = profile?.data?.me;
      this.logger.debug(`🔹 Snapchat Profile: ${JSON.stringify(me)}`);

      const meta = req.session?.oauthMetadata;
      if (!meta) {
        this.logger.error('❌ Snapchat Strategy: No metadata in session');
        return done(
          new Error('Session lost: Missing workspace metadata'),
          false,
        );
      }

      const { workspaceId, token: jwtToken } = meta;

      let userId: string | undefined;
      if (jwtToken) {
        const user = await this.authService.validateUserByToken(jwtToken);
        userId = user?.id;
      }

      if (!userId) {
        return done(
          new Error('User session lost during Snapchat OAuth'),
          false,
        );
      }

      done(null, {
        platform: 'SNAPCHAT',
        platformUserId: me?.externalId || me?.displayName,
        name: me?.displayName || 'Snapchat User',
        avatar: me?.bitmoji?.avatar || null,
        accessToken,
        refreshToken,
        workspaceId,
        userId,
      });
    } catch (error) {
      const msg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(`Snapchat OAuth Validation Failed: ${msg}`);
      done(error, false);
    }
  }
}
