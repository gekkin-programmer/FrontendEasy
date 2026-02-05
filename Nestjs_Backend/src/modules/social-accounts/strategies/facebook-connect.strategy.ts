import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class FacebookConnectStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || 'fb_id_placeholder',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || 'fb_secret_placeholder',
      callbackURL: `${configService.get<string>('BACKEND_URL') || 'http://localhost:3000'}/api/social-accounts/callback/facebook`,
      
      // ➤ CRITICAL: Must be true to read 'state'
      passReqToCallback: true, 
      state: false, 
      
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
      profileFields: ['id', 'displayName', 'emails', 'photos'],
    });
  }

  // ➤ Updated validate signature to include 'req'
  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      console.log("🔹 Facebook OAuth Validate Triggered");
      let state = {};
      if (req.query.state) {
          try {
            const decodedState = Buffer.from(req.query.state as string, 'base64').toString();
            state = JSON.parse(decodedState);
            console.log("🔹 Facebook Decoded State:", state);
          } catch(e) {
            console.warn("⚠️ Could not parse OAuth state:", req.query.state);
          }
      } else {
          console.error("❌ No state found in query params!");
      }
      
      const { workspaceId, token, userId: stateUserId, platform, isWhatsapp } = state as any;

      // 2. Resolve User ID (Either from State or JWT Token in State)
      let userId = stateUserId;
      if (!userId && token) {
         const user = await this.authService.validateUserByToken(token);
         userId = user?.id;
      }

      if (!userId) {
          console.error("❌ UserId resolution failed. Token valid?", !!token);
          return done(new Error("User session lost during OAuth"), false);
      }

      const payload = {
        platform: isWhatsapp ? 'WHATSAPP' : (platform || 'FACEBOOK'),
        platformUserId: profile.id,
        avatar: profile.photos?.[0]?.value || profile._json?.picture?.data?.url, 
        name: profile.displayName || 'Facebook User',
        accessToken,
        refreshToken,
        // ➤ Pass these to controller/service
        workspaceId, 
        userId 
      };
      
      done(null, payload);
    } catch (error) {
      done(error, false);
    }
  }
}