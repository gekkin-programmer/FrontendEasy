// ➤ FORCE UTC 
process.env.TZ = 'UTC';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // ➤ IMPROVEMENT: Use env variable for cookie secret, fallback to string for dev
  app.use(cookieParser(process.env.COOKIE_SECRET || 'super-secret-cookie-key')); 

  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ➤ CHECK: Make sure your frontend really runs on 3001. 
  // Standard Next.js is 3000. If you run both locally, one usually shifts to 3001.
  app.enableCors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:3001', 
        'https://easyposttio.vercel.app'
    ],
    credentials: true, 
  });

  const config = new DocumentBuilder()
    .setTitle('EasyPost API')
    .setDescription('The Digital Marketing Engine for Africa')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ➤ CRITICAL FIX FOR RENDER DEPLOYMENT
  // 1. Use process.env.PORT
  // 2. Bind to '0.0.0.0' (required for Docker/Render containers)
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📚 Swagger Docs available at /api/docs`);
}
bootstrap();