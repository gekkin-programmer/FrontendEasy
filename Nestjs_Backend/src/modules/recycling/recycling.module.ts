import { Module } from '@nestjs/common';
import { RecyclingService } from './recycling.service';
import { RecyclingController } from './recycling.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, ConfigModule],
  providers: [RecyclingService],
  controllers: [RecyclingController],
  exports: [RecyclingService]
})
export class RecyclingModule {}