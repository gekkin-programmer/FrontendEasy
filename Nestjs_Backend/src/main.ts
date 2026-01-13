import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Body Parser Limits (for Video Uploads)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // 2. Cookie Parser (For OAuth State)
  app.use(cookieParser('super-secret-cookie-key')); 

  // 3. Global Prefix
  app.setGlobalPrefix('api');

  // 4. Validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // 5. CORS (Allow Frontend)
  app.enableCors({
    origin: ['http://localhost:3001', 'https://easyposttio.vercel.app'],
    credentials: true, 
  });

  // 6. Swagger
  const config = new DocumentBuilder()
    .setTitle('EasyPost API')
    .setDescription('The Digital Marketing Engine for Africa')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`🚀 Server running on http://localhost:3000/api`);
  console.log(`📚 Swagger Docs at http://localhost:3000/api/docs`);
}
bootstrap();