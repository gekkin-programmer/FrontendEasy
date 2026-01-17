import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq'; // <--- IMPORT THIS
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
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { ContentCalendarModule } from './modules/content-calendar/content-calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // BLOCK FOR REDIS/BULLMQ ---
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get('REDIS_PASSWORD'),
          // This handles the TLS connection for Upstash
          tls: configService.get('REDIS_TLS') === 'true' 
            ? { rejectUnauthorized: false } 
            : undefined,
        },
      }),
      inject: [ConfigService],
    }),
    // ---------------------------------------

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
    ContentCalendarModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}