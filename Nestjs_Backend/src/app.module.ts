import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AiModule } from './modules/ai/ai.module';
import { MediaModule } from './modules/media/media.module';
import { AssistantModule } from './modules/assistant/assistant.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CloudinaryModule } from './modules/providers/cloudinary.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AiModule,
    MediaModule,
    AssistantModule,
    PaymentsModule,
    CloudinaryModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}