import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { TeamsModule } from './modules/teams/teams.module';
import { SocialAccountsModule } from './modules/social-accounts/social-accounts.module';
import { PostsModule } from './modules/posts/posts.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { ContentCalendarModule } from './modules/content-calendar/content-calendar.module';
import { StreamsModule } from './modules/streams/streams.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { TagsModule } from './modules/tags/tags.module';
import { LabelsModule } from './modules/labels/labels.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ActivityModule } from './modules/activity/activity.module';
import { SubscriptionModule } from './modules/subscription/subscription.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    TeamsModule,
    SocialAccountsModule,
    PostsModule,
    CampaignsModule,
    ContentCalendarModule,
    StreamsModule,
    AnalyticsModule,
    TagsModule,
    LabelsModule,
    TasksModule,
    NotificationsModule,
    ActivityModule,
    SubscriptionModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}