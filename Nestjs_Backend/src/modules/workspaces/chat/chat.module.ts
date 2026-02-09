import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AppEventsModule } from '../../app-events/app-events.module';

@Module({
  imports: [PrismaModule, AppEventsModule],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
