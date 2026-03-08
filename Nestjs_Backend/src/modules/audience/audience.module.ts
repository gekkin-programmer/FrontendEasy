import { Module } from '@nestjs/common';
import { AudienceService } from './audience.service';
import { AudienceController } from './audience.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AppEventsModule } from '../app-events/app-events.module';

@Module({
  imports: [PrismaModule, AppEventsModule],
  providers: [AudienceService],
  controllers: [AudienceController],
  exports: [AudienceService],
})
export class AudienceModule {}
