import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';
import axios from 'axios';

@Injectable()
export class FacebookConnectStrategy extends PassportStrategy(Strategy, 'facebook') {
  private readonly logger = new Logger(FacebookConnectStrategy.name);

  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      authorizationURL: 'https://www.facebook.com/v19.0/dialog/oauth',
      tokenURL: 'https://graph.facebook.com/v19.0/oauth/access_token',
      clientID: configService.get<string>('FACEBOOK_APP_ID') || 'fb_id_placeholder',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || 'fb_secret_placeholder',
      callbackURL: `${configService.get<string>('API_URL') || 'https://easypostv2.onrender.com'}/api/social-accounts/callback/facebook`,
      scope: [
        'email', 
        'public_profile',
        'pages_show_list', 
        'pages_read_engagement', 
        'pages_manage_posts',
        'pages_read_user_content',
        'instagram_basic',
        'instagram_content_publish',
        'whatsapp_business_management',
        'whatsapp_business_messaging'
      ],
      state: true,
      passReqToCallback: true,
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, results: any, done: Function) {
    try {
      this.logger.log("🔹 Meta OAuth 2.0 (Manual) Triggered");

      // 1. Manually fetch Facebook user profile
      const { data: profile } = await axios.get('https://graph.facebook.com/v19.0/me?fields=id,name,email,picture', {
        params: { access_token: accessToken }
      });

      this.logger.debug(`🔹 Meta Profile Data: ${JSON.stringify(profile)}`);

      // 2. Retrieve metadata from session (cookie-session)
      const meta = req.session?.oauthMetadata;
      if (!meta) {
          this.logger.error("❌ Meta Strategy: No metadata found in session");
          return done(new Error("Session lost: Missing workspace metadata"), false);
      }

      const { workspaceId, token: jwtToken, platform, isWhatsapp } = meta;

      let userId;
      if (jwtToken) {
         const user = await this.authService.validateUserByToken(jwtToken);
         userId = user?.id;
      }

      if (!userId) {
          this.logger.error("❌ UserId resolution failed");
          return done(new Error("User session lost during OAuth"), false);
      }

      const payload = {
        platform: isWhatsapp ? 'WHATSAPP' : (platform || 'FACEBOOK'),
        platformUserId: profile.id,
        avatar: profile.picture?.data?.url, 
        name: profile.name || 'Meta User',
        accessToken,
        refreshToken,
        workspaceId, 
        userId 
      };
      
      done(null, payload);
    } catch (error) {
      const errorMsg = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      this.logger.error(`Meta OAuth Validation Failed: ${errorMsg}`);
      done(error, false);
    }
  }
}