import { Module } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import { SocialAccountsController } from './social-accounts.controller';
import { FacebookConnectStrategy } from './strategies/facebook-connect.strategy';
import { LinkedInConnectStrategy } from './strategies/linkedin-connect.strategy';
import { TikTokConnectStrategy } from './strategies/tiktok-connect.strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [SocialAccountsController],
  providers: [SocialAccountsService, FacebookConnectStrategy, LinkedInConnectStrategy, TikTokConnectStrategy],
})
export class SocialAccountsModule {}