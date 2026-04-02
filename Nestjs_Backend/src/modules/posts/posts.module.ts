import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { SchedulerService } from './scheduler/scheduler.service';
import { PublisherService } from './publishing/publisher.service';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  controllers: [PostsController],
  providers: [PostsService, SchedulerService, PublisherService],
})
export class PostsModule {}
