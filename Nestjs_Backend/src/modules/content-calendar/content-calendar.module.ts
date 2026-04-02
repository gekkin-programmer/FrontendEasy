import { Module } from '@nestjs/common';
import { ContentCalendarService } from './content-calendar.service';
import { ContentCalendarController } from './content-calendar.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ContentCalendarController],
  providers: [ContentCalendarService],
})
export class ContentCalendarModule {}
