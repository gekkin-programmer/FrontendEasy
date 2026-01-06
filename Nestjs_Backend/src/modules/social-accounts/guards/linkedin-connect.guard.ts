import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LinkedInConnectGuard extends AuthGuard('linkedin-connect') {
  
  getAuthenticateOptions() {
    return {
      session: false, 
    };
  }
}