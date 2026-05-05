import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class LinkedInConnectStrategy extends PassportStrategy(
  Strategy,
  'linkedin',
) {
  private readonly logger = new Logger(LinkedInConnectStrategy.name);

  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://www.linkedin.com/oauth/v2/authorization',
      tokenURL: 'https://www.linkedin.com/oauth/v2/accessToken',
      clientID:
        configService.get<string>('LINKEDIN_CLIENT_ID') || 'placeholder',
      clientSecret:
        configService.get<string>('LINKEDIN_CLIENT_SECRET') || 'placeholder',
      callbackURL:
        configService.get<string>('LINKEDIN_CALLBACK_URL') ||
        `${configService.get<string>('API_URL') || 'https://easypostv2.onrender.com'}/api/social-accounts/callback/linkedin`,
      scope: ['openid', 'profile', 'email', 'w_member_social'],
      state: true,
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    _results: any,
  ): Promise<any> {
    try {
      this.logger.log('🔹 LinkedIn OIDC Flow Triggered');

      const { data: profile } = await axios.get(
        'https://api.linkedin.com/v2/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      this.logger.debug(`🔹 LinkedIn Profile: ${JSON.stringify(profile)}`);

      const meta = req.session?.oauthMetadata;
      if (!meta) {
        throw new Error('Session lost: Missing workspace metadata');
      }

      const { workspaceId, token: jwtToken } = meta;
      const user = await this.authService.validateUserByToken(jwtToken);
      const userId = user?.id;

      if (!userId) {
        throw new Error('User session lost during LinkedIn OAuth');
      }

      return {
        platform: 'LINKEDIN',
        platformUserId: profile.sub,
        name: profile.name || 'LinkedIn User',
        avatar: profile.picture,
        accessToken,
        refreshToken,
        workspaceId,
        userId,
      };
    } catch (error) {
      this.logger.error(`LinkedIn OAuth Validation Failed: ${error.message}`);
      throw error;
    }
  }
}
