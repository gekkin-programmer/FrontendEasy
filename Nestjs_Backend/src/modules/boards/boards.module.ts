import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { AppEventsModule } from '../app-events/app-events.module';

@Module({
  imports: [PrismaModule, AppEventsModule],
  providers: [BoardsService],
  controllers: [BoardsController],
  exports: [BoardsService],
})
export class BoardsModule {}
