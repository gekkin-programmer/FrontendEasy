import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { GoogleProfile } from '../interfaces/google-profile.interface';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos, id } = profile;
    
    const googleProfile: GoogleProfile = {
      sub: id,
      email: emails[0].value,
      email_verified: emails[0].verified || false,
      name: name.givenName + ' ' + name.familyName,
      given_name: name.givenName,
      family_name: name.familyName,
      picture: photos[0].value,
      locale: profile._json.locale || 'en',
    };

    try {
      const user = await this.authService.validateGoogleUser(googleProfile);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}