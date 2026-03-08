import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AppEventsModule } from '../app-events/app-events.module';

@Module({
  imports: [PrismaModule, AppEventsModule], // Importez PrismaModule
  providers: [UsersService],
  controllers: [UsersController], // Enlevez PrismaService de controllers
})
export class UsersModule {}
