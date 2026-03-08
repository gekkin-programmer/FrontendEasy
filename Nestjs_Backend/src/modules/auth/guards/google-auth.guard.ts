import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor() {
    super();
  }

  getAuthenticateOptions() {
    return {
      session: false,
      scope: ['email', 'profile'],
    };
  }
}
