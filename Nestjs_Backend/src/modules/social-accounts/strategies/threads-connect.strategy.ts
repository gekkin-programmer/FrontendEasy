import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class ThreadsConnectStrategy extends PassportStrategy(
  Strategy,
  'threads',
) {
  private readonly logger = new Logger(ThreadsConnectStrategy.name);

  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://threads.net/oauth/authorize',
      tokenURL: 'https://graph.threads.net/oauth/access_token',
      clientID:
        configService.get<string>('THREADS_APP_ID') ||
        configService.get<string>('FACEBOOK_APP_ID') ||
        'threads_id_fallback',
      clientSecret:
        configService.get<string>('THREADS_APP_SECRET') ||
        configService.get<string>('FACEBOOK_APP_SECRET') ||
        'threads_secret_fallback',
      callbackURL: `${configService.get<string>('API_URL') || 'https://backend-eazypost.mbokofit.com'}/api/social-accounts/callback/threads`,
      scope: ['threads_basic', 'threads_content_publish'],
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
      this.logger.log('Threads OAuth triggered');

      const { data: profile } = await axios.get(
        'https://graph.threads.net/v1.0/me',
        {
          params: {
            fields: 'id,username,name,threads_profile_picture_url',
            access_token: accessToken,
          },
        },
      );

      this.logger.debug(`Threads Profile: ${JSON.stringify(profile)}`);

      const meta = req.session?.oauthMetadata;
      if (!meta) {
        this.logger.error('No session metadata found');
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
        this.logger.error('UserId resolution failed');
        return done(new Error('User session lost during OAuth'), false);
      }

      done(null, {
        platform: 'THREADS',
        platformUserId: profile.id,
        name: profile.username || profile.name || 'Threads User',
        avatar: profile.threads_profile_picture_url,
        accessToken: accessToken,
        refreshToken: refreshToken,
        workspaceId,
        userId,
      });
    } catch (error) {
      const msg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(`Threads OAuth failed: ${msg}`);
      done(error, false);
    }
  }
}
