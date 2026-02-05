import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-twitter-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class TwitterConnectStrategy extends PassportStrategy(Strategy, 'twitter-oauth2') {
  constructor(
    configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('TWITTER_API_KEY') || 'placeholder',
      clientSecret: configService.get<string>('TWITTER_API_SECRET') || 'placeholder',
      callbackURL: configService.get<string>('TWITTER_CALLBACK_URL') || `${configService.get<string>('API_URL') || 'https://easypostv2.onrender.com'}/api/social-accounts/callback/twitter`,
      authorizationURL: 'https://twitter.com/i/oauth2/authorize',
      tokenURL: 'https://api.twitter.com/2/oauth2/token',
      clientType: 'confidential',
      pkce: false, // ➤ Disable PKCE to bypass session requirement
      state: false, // ➤ Disable internal state (using manual session metadata)
      passReqToCallback: true,
      skipUserProfile: false,
      scope: [
        'tweet.read',
        'tweet.write',
        'users.read',
        'offline.access',
        'dm.read',
        'dm.write'
      ],
      scopeSeparator: ' ', // ➤ CRITICAL: X requires spaces, not commas
      customHeaders: {
        Authorization: `Basic ${Buffer.from(
          `${configService.get<string>('TWITTER_API_KEY')}:${configService.get<string>('TWITTER_API_SECRET')}`
        ).toString('base64')}`
      },
    });
    const key = configService.get<string>('TWITTER_API_KEY');
    const secret = configService.get<string>('TWITTER_API_SECRET');
    console.log(`🔹 Twitter Strategy Init: Key=${key ? key.substring(0,4)+'***' : 'PRESENT'}, Secret=${secret ? 'PRESENT' : 'MISSING'}`);
  }

  // ➤ Handle Token Parameters (Inject Code Verifier)
  authenticate(req: any, options: any) {
    const stateCookie = req.signedCookies['twitter_oauth_state'];
    if (stateCookie) {
        try {
            const { code_verifier } = JSON.parse(stateCookie);
            options.codeVerifier = code_verifier;
            console.log("🔹 Twitter Strategy: code_verifier injected from cookie");
        } catch (e) {}
    }
    super.authenticate(req, options);
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: Function) {
    try {
      console.log("🔹 Twitter OAuth 2.0 Validate Triggered");
      
      // Retrieve metadata from Signed Cookie
      const stateCookie = req.signedCookies['twitter_oauth_state'];
      if (!stateCookie) {
          console.error("❌ Twitter Strategy: No metadata found in signed cookie");
          return done(new Error("Session lost: Missing state cookie"), false);
      }

      const { workspaceId, token: jwtToken } = JSON.parse(stateCookie);
      console.log("🔹 Twitter Strategy: Metadata retrieved", { workspaceId, hasToken: !!jwtToken });

      let userId;
      if (jwtToken) {
         const user = await this.authService.validateUserByToken(jwtToken);
         userId = user?.id;
      }

      const payload = {
        platform: 'TWITTER',
        platformUserId: profile.id,
        name: profile.displayName || profile.username,
        avatar: profile.photos?.[0]?.value,
        accessToken,
        refreshToken, 
        workspaceId,
        userId
      };
      done(null, payload);
    } catch (error) {
      done(error, false);
    }
  }
}