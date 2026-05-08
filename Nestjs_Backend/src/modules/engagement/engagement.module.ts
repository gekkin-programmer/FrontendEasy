import { Module } from '@nestjs/common';
import { EngagementController } from './engagement.controller';
import { EngagementService } from './engagement.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SocialAccountsModule } from '../social-accounts/social-accounts.module';
import { FacebookService } from '../social-accounts/platforms/facebook.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, SocialAccountsModule, HttpModule],
  controllers: [EngagementController],
  providers: [EngagementService, FacebookService],
  exports: [EngagementService],
})
export class EngagementModule {}
