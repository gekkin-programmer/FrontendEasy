import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class InstagramBusinessConnectStrategy extends PassportStrategy(
  Strategy,
  'instagram-business',
) {
  private readonly logger = new Logger(InstagramBusinessConnectStrategy.name);

  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://api.instagram.com/oauth/authorize',
      tokenURL: 'https://api.instagram.com/oauth/access_token',
      clientID:
        configService.get<string>('INSTAGRAM_APP_ID') || 'ig_id_placeholder',
      clientSecret:
        configService.get<string>('INSTAGRAM_APP_SECRET') ||
        'ig_secret_placeholder',
      callbackURL: `${configService.get<string>('API_URL') || 'https://backend-eazypost.mbokofit.com'}/api/social-accounts/callback/instagram-business`,
      scope: [
        'instagram_business_basic',
        'instagram_business_content_publish',
        'instagram_business_manage_comments',
        'instagram_business_manage_insights',
      ],
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
      this.logger.log('Instagram Business OAuth triggered');

      // Exchange short-lived token for long-lived token
      const { data: longLived } = await axios.get(
        'https://graph.instagram.com/access_token',
        {
          params: {
            grant_type: 'ig_exchange_token',
            client_secret:
              process.env.INSTAGRAM_APP_SECRET || 'ig_secret_placeholder',
            access_token: accessToken,
          },
        },
      );

      const finalToken = longLived.access_token || accessToken;

      // Fetch IG Business profile
      const { data: profile } = await axios.get(
        'https://graph.instagram.com/v21.0/me',
        {
          params: {
            fields: 'id,username,name,profile_picture_url,followers_count',
            access_token: finalToken,
          },
        },
      );

      this.logger.debug(`IG Business Profile: ${JSON.stringify(profile)}`);

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
        platform: 'INSTAGRAM',
        platformUserId: profile.id,
        name: profile.username || profile.name || 'Instagram User',
        avatar: profile.profile_picture_url,
        accessToken: finalToken,
        refreshToken: longLived.access_token ? null : refreshToken,
        workspaceId,
        userId,
      });
    } catch (error) {
      const msg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(`Instagram Business OAuth failed: ${msg}`);
      done(error, false);
    }
  }
}
