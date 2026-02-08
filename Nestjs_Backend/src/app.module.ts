import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq'; 
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './modules/ai/ai.module';
import { MediaModule } from './modules/media/media.module';
import { AssistantModule } from './modules/assisstant/assistant.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CloudinaryModule } from './modules/providers/cloudinary.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { MembersModule } from './modules/workspaces/members/members.module';
import { SocialAccountsModule } from './modules/social-accounts/social-accounts.module';
import { PostsModule } from './modules/posts/posts.module';
import { SentryModule } from '@sentry/nestjs/setup';
import { LoggerModule } from './modules/logger/logger.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ContentCalendarModule } from './modules/content-calendar/content-calendar.module';
import { EngagementModule } from './modules/engagement/engagement.module';
import { CreatorFundModule } from './modules/creator-fund/creator-fund.module';
import { CommunityModule } from './modules/community/community.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppEventsModule } from './modules/app-events/app-events.module';
import { BoardsModule } from './modules/boards/boards.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AudienceModule } from './modules/audience/audience.module';
import { RecyclingModule } from './modules/recycling/recycling.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule,
    SentryModule.forRoot(),

    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
          tls: configService.get('REDIS_TLS') === 'true' 
            ? { rejectUnauthorized: false } 
            : undefined,
        },
      }),
      inject: [ConfigService],
    }),

    PrismaModule,
    AuthModule,
    UsersModule,
    AiModule,
    AssistantModule,
    MediaModule,
    PaymentsModule,
    CloudinaryModule,
    WorkspacesModule,
    MembersModule,
    SocialAccountsModule,
    PostsModule,
    AnalyticsModule,
    ContentCalendarModule,
    EngagementModule,
    CreatorFundModule,
    CommunityModule,
    AdminModule,
    AppEventsModule,
    BoardsModule,
    NotificationsModule,
    AudienceModule,
    RecyclingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
