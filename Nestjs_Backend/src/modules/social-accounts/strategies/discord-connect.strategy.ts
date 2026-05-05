import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class DiscordConnectStrategy extends PassportStrategy(
  Strategy,
  'discord',
) {
  private readonly logger = new Logger(DiscordConnectStrategy.name);

  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://discord.com/oauth2/authorize',
      tokenURL: 'https://discord.com/api/oauth2/token',
      clientID: configService.get<string>('DISCORD_CLIENT_ID') || 'placeholder',
      clientSecret:
        configService.get<string>('DISCORD_CLIENT_SECRET') || 'placeholder',
      callbackURL:
        configService.get<string>('DISCORD_CALLBACK_URL') ||
        `${configService.get<string>('API_URL') || 'http://localhost:3000'}/api/social-accounts/callback/discord`,
      scope: ['identify', 'email', 'guilds'],
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
      this.logger.log('🔹 Discord OAuth 2.0 Triggered');

      const { data: profile } = await axios.get(
        'https://discord.com/api/users/@me',
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      this.logger.debug(`🔹 Discord Profile: ${JSON.stringify(profile)}`);

      const meta = req.session?.oauthMetadata;
      if (!meta) {
        this.logger.error('❌ Discord Strategy: No metadata in session');
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
        return done(new Error('User session lost during Discord OAuth'), false);
      }

      const avatar = profile.avatar
        ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        : null;

      done(null, {
        platform: 'DISCORD',
        platformUserId: profile.id,
        name: profile.global_name || profile.username,
        avatar,
        accessToken,
        refreshToken,
        workspaceId,
        userId,
      });
    } catch (error) {
      const msg = error.response?.data
        ? JSON.stringify(error.response.data)
        : error.message;
      this.logger.error(`Discord OAuth Validation Failed: ${msg}`);
      done(error, false);
    }
  }
}
