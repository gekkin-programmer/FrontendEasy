import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class TwitterConnectStrategy extends PassportStrategy(
  Strategy,
  'twitter-oauth2',
) {
  private readonly logger = new Logger(TwitterConnectStrategy.name);

  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    const key = configService.get<string>('TWITTER_API_KEY');
    const secret = configService.get<string>('TWITTER_API_SECRET');

    super({
      authorizationURL: 'https://twitter.com/i/oauth2/authorize',
      tokenURL: 'https://api.twitter.com/2/oauth2/token',
      clientID: key || 'placeholder',
      clientSecret: secret || 'placeholder',
      callbackURL:
        configService.get<string>('TWITTER_CALLBACK_URL') ||
        `${configService.get<string>('API_URL') || 'https://easypostv2.onrender.com'}/api/social-accounts/callback/twitter`,
      scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
      scopeSeparator: ' ',
      pkce: true,
      state: true,
      passReqToCallback: true,
      customHeaders: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`,
      },
    });
  }

  /**
   * Appends extra query-params to the X authorization URL.
   * force_login=false → reuse existing X browser session to reduce
   * the "suspicious login" block that X triggers on repeated OAuth flows.
   */
  authorizationParams(
    options: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      ...options,
      force_login: 'false',
    };
  }

  /**
   * NestJS PassportStrategy wrapper calls this.validate(...params) and then
   * calls done(null, returnValue) with whatever this method returns.
   * Do NOT call done() directly — just return the payload or throw on error.
   */
  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    _results: any,
  ): Promise<any> {
    try {
      this.logger.log('🔹 Twitter OAuth 2.0 Triggered');

      const { data: profileData } = await axios.get(
        'https://api.twitter.com/2/users/me?user.fields=profile_image_url,verified',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      const profile = profileData.data;
      this.logger.debug(`🔹 Twitter Profile: ${JSON.stringify(profile)}`);

      const meta = req.session?.oauthMetadata;
      if (!meta) {
        throw new Error('Session lost: Missing workspace metadata');
      }

      const { workspaceId, token: jwtToken } = meta;
      const user = await this.authService.validateUserByToken(jwtToken);
      const userId = user?.id;

      if (!userId) {
        throw new Error('User session lost during Twitter OAuth');
      }

      return {
        platform: 'TWITTER',
        platformUserId: profile.id,
        name: profile.username || profile.name || 'Twitter User',
        avatar: profile.profile_image_url,
        accessToken,
        refreshToken,
        workspaceId,
        userId,
      };
    } catch (error) {
      const errorMsg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(`Twitter OAuth Validation Failed: ${errorMsg}`);
      throw error;
    }
  }
}
