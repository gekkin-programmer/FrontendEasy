import { Module } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { PrismaModule } from '../../../prisma/prisma.module';
import { EmailModule } from '../../../common/providers/email/email.module';

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
