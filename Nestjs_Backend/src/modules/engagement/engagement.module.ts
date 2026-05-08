import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EngagementController } from './engagement.controller';
import { EngagementService } from './engagement.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SocialAccountsModule } from '../social-accounts/social-accounts.module';
import { FacebookService } from '../social-accounts/platforms/facebook.service';
import { InstagramService } from '../social-accounts/platforms/instagram.service';

@Module({
  imports: [PrismaModule, SocialAccountsModule, HttpModule],
  controllers: [EngagementController],
  providers: [EngagementService, FacebookService, InstagramService],
  exports: [EngagementService],
})
export class EngagementModule {}
