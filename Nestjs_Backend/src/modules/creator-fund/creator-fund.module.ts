import { Module } from '@nestjs/common';
import { CreatorFundService } from './creator-fund.service';
import { CreatorFundController } from './creator-fund.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CreatorFundService],
  controllers: [CreatorFundController],
  exports: [CreatorFundService]
})
export class CreatorFundModule {}
