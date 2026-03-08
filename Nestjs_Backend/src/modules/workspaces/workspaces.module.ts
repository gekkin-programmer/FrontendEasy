import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ChatModule } from './chat/chat.module';
import { AppEventsModule } from '../app-events/app-events.module';

@Module({
  imports: [PrismaModule, ChatModule, AppEventsModule],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
