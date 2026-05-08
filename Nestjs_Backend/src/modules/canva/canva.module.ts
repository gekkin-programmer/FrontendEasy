import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../../prisma/prisma.module';
import { GcsModule } from '../providers/gcs.module';
import { AuthModule } from '../auth/auth.module';
import { CanvaController } from './canva.controller';
import { CanvaService } from './canva.service';

@Module({
  imports: [PrismaModule, ConfigModule, HttpModule, GcsModule, AuthModule],
  controllers: [CanvaController],
  providers: [CanvaService],
  exports: [CanvaService],
})
export class CanvaModule {}
