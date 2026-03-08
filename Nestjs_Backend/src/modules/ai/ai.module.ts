import { Module, Global } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { ConfigModule } from '@nestjs/config';
import { SmartSchedulingModule } from './smart-scheduling/smart-scheduling.module';

@Global()
@Module({
  imports: [ConfigModule, SmartSchedulingModule],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
