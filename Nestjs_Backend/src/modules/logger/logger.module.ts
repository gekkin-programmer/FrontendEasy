import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production' 
          ? { target: 'pino-pretty' } 
          : undefined,
        level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
        // Redact sensitive keys
        redact: ['req.headers.authorization', 'req.headers.cookie', 'body.password'],
        autoLogging: false, // Disable auto logging for every request if too noisy, or keep true
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
