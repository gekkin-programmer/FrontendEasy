import { Module } from '@nestjs/common';
import { SocialAccountsService } from './social-accounts.service';
import { SocialAccountsController } from './social-accounts.controller';
import { FacebookConnectStrategy } from './strategies/facebook-connect.strategy';
import { LinkedInConnectStrategy } from './strategies/linkedin-connect.strategy';
import { TikTokConnectStrategy } from './strategies/tiktok-connect.strategy';
import { YoutubeConnectStrategy } from './strategies/youtube-connect.strategy';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt'; 

@Module({
  imports: [
    PrismaModule, 
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' }, 
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SocialAccountsController],
  providers: [
    SocialAccountsService, 
    FacebookConnectStrategy, 
    LinkedInConnectStrategy, 
    TikTokConnectStrategy, 
    YoutubeConnectStrategy
  ],
})
export class SocialAccountsModule {}