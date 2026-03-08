import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class TwitterConnectStrategy extends PassportStrategy(Strategy, 'twitter-oauth2') {
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
      callbackURL: configService.get<string>('TWITTER_CALLBACK_URL') || `${configService.get<string>('API_URL') || 'https://backend-eazypost.mbokofit.com'}/api/social-accounts/callback/twitter`,
      scope: ['tweet.read', 'tweet.write', 'users.read', 'offline.access', 'dm.read', 'dm.write'],
      scopeSeparator: ' ',
      pkce: true,
      state: true,
      passReqToCallback: true,
      customHeaders: {
        Authorization: `Basic ${Buffer.from(`${key}:${secret}`).toString('base64')}`
      }
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, results: any, done: Function) {
    try {
      this.logger.log("🔹 Twitter OAuth 2.0 (Manual) Triggered");

      // 1. Manually fetch user profile from X API v2
      const { data: profileData } = await axios.get('https://api.twitter.com/2/users/me?user.fields=profile_image_url,verified', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const profile = profileData.data;
      this.logger.debug(`🔹 Twitter Profile Data: ${JSON.stringify(profile)}`);

      // 2. Retrieve metadata from session (cookie-session)
      const meta = req.session?.oauthMetadata;
      if (!meta) {
          this.logger.error("❌ Twitter Strategy: No metadata found in session");
          return done(new Error("Session lost: Missing workspace metadata"), false);
      }

      const { workspaceId, token: jwtToken } = meta;

      let userId;
      if (jwtToken) {
         const user = await this.authService.validateUserByToken(jwtToken);
         userId = user?.id;
      }

      if (!userId) {
          return done(new Error("User session lost during Twitter OAuth"), false);
      }

      const payload = {
        platform: 'TWITTER',
        platformUserId: profile.id,
        name: profile.username || profile.name || 'Twitter User',
        avatar: profile.profile_image_url,
        accessToken,
        refreshToken, 
        workspaceId,
        userId
      };
      
      done(null, payload);
    } catch (error) {
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      this.logger.error(`Twitter OAuth Validation Failed: ${errorMsg}`);
      done(error, false);
    }
  }
}