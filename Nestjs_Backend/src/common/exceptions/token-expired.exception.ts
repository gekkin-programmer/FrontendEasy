import { UnauthorizedException } from '@nestjs/common';

export class SocialTokenExpiredException extends UnauthorizedException {
  constructor(platform: string) {
    super(`Access token for ${platform} has expired or was revoked.`);
  }
}