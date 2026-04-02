import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Importez PrismaModule
  providers: [UsersService],
  controllers: [UsersController], // Enlevez PrismaService de controllers
})
export class UsersModule {}
