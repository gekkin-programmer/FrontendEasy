import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'; // <--- NEW: For API calls
import { BullModule } from '@nestjs/bullmq'; // <--- NEW: For Queue
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

// Controllers & Services
import { SocialAccountsController } from './social-accounts.controller';
import { SocialAccountsService } from './social-accounts.service';

// OAuth Strategies (Your existing auth logic)
import { FacebookConnectStrategy } from './strategies/facebook-connect.strategy';
import { LinkedInConnectStrategy } from './strategies/linkedin-connect.strategy';
import { TikTokConnectStrategy } from './strategies/tiktok-connect.strategy';
import { YoutubeConnectStrategy } from './strategies/youtube-connect.strategy';
import { TwitterConnectStrategy } from './strategies/twitter-connect.strategy';
import { SnapchatConnectStrategy } from './strategies/snapchat-connect.strategy';
import { PinterestConnectStrategy } from './strategies/pinterest-connect.strategy';
import { DiscordConnectStrategy } from './strategies/discord-connect.strategy';
import { InstagramBusinessConnectStrategy } from './strategies/instagram-business-connect.strategy';
import { ThreadsConnectStrategy } from './strategies/threads-connect.strategy';

// Sync Engine (The new logic for fetching history)
import { FacebookService } from './platforms/facebook.service';
import { InstagramService } from './platforms/instagram.service';
import { TwitterService } from './platforms/twitter.service';
import { LinkedinService } from './platforms/linkedin.service';
import { TiktokService } from './platforms/tiktok.service';
import { SocialSyncProcessor } from './workers/social-sync.processor';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    HttpModule,
    AuthModule,

    // <--- Required for Background Jobs
    BullModule.registerQueue({
      name: 'social-sync',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
      },
    }),

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

    // Auth Strategies
    FacebookConnectStrategy,
    LinkedInConnectStrategy,
    TikTokConnectStrategy,
    YoutubeConnectStrategy,
    TwitterConnectStrategy,
    SnapchatConnectStrategy,
    PinterestConnectStrategy,
    DiscordConnectStrategy,
    InstagramBusinessConnectStrategy,
    ThreadsConnectStrategy,

    // Sync Providers
    FacebookService,
    InstagramService,
    TwitterService,
    LinkedinService,
    TiktokService,
    SocialSyncProcessor,
  ],
  exports: [SocialAccountsService],
})
export class SocialAccountsModule {}
