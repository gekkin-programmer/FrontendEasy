import { Module } from '@nestjs/common';
import { EngagementController } from './engagement.controller';
import { EngagementService } from './engagement.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SocialAccountsModule } from '../social-accounts/social-accounts.module'; 
import { FacebookService } from '../social-accounts/platforms/facebook.service';
import { InstagramService } from '../social-accounts/platforms/instagram.service';
import { TwitterService } from '../social-accounts/platforms/twitter.service';
import { HttpModule } from '@nestjs/axios'; 

@Module({
  imports: [
    PrismaModule, 
    SocialAccountsModule, 
    HttpModule
  ],
  controllers: [EngagementController],
  providers: [
    EngagementService, 
    FacebookService,
    InstagramService,
    TwitterService
  ],
})
export class EngagementModule {}