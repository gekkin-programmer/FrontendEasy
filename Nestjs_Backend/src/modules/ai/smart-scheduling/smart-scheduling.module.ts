import { Module } from '@nestjs/common';
import { SmartSchedulingService } from './smart-scheduling.service';
import { SmartSchedulingController } from './smart-scheduling.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, HttpModule, ConfigModule],
  controllers: [SmartSchedulingController],
  providers: [SmartSchedulingService],
  exports: [SmartSchedulingService],
})
export class SmartSchedulingModule {}
