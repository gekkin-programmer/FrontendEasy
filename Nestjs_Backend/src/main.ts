// src/main.ts
import './instrument';

// Force UTC timezone for consistent date handling across environments
process.env.TZ = 'UTC';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import helmet from 'helmet'; // Added for security headers
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Trust proxy for Render/Vercel (corrects req.protocol)
  (app.getHttpAdapter().getInstance() as any).set('trust proxy', 1);

  // Use Pino Logger
  app.useLogger(app.get(Logger));

  // ── Security & parsing ────────────────────────────────────────────────
  app.use(helmet()); // Security headers (XSS, clickjacking, etc.)

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Cookie parser with secure secret from env (fallback only for local dev)
  app.use(cookieParser(process.env.COOKIE_SECRET || 'dev-cookie-secret-CHANGE-ME'));

  // Stateless session support for OAuth 2.0 State/PKCE
  app.use(
    cookieSession({
      name: 'session',
      keys: [process.env.COOKIE_SECRET || 'dev-session-secret'],
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }),
  );

  // Global API prefix – all endpoints become /api/...
  app.setGlobalPrefix('api', {
    // Optional: keep root health check if needed for Render monitoring
    // exclude: ['/health'],
  });

  // Global validation (strip unknown properties, auto-transform payloads)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── CORS ───────────────────────────────────────────────────────────────
  // In production, prefer splitting origins via env var
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://easyposttio.vercel.app',
        // Add preview domains if using Vercel previews: 'https://*.easyposttio.vercel.app'
      ];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count'], // useful for pagination
    maxAge: 86400, // 24 hours – reduces preflight requests
  });

  // ── Swagger / API Documentation ───────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('EasyPost API')
    .setDescription('The Digital Marketing Engine for Africa – Social Content & Team Productivity')
    .setVersion('2.0') // bumped version to reflect v2 of the product
    .addBearerAuth()
    .addServer(process.env.API_URL || 'https://easypostv2.onrender.com', 'Production')
    .addServer('http://localhost:3000', 'Local Development')
    .addTag('auth', 'Authentication, sessions, OAuth')
    .addTag('health', 'System health & monitoring')
    .addTag('posts', 'Content creation, scheduling, publishing')
    .addTag('workspaces', 'Teams, organizations, members')
    .addTag('social-accounts', 'Connected social media profiles')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Mount Swagger at /api-docs (root level, matching Final-Configuration.md)
  SwaggerModule.setup('api-docs', app, document, {
    useGlobalPrefix: false, // Serve at /api-docs, not /api/api-docs
    swaggerOptions: {
      persistAuthorization: true, // keeps bearer token between refreshes
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: '.swagger-ui .topbar { display: none }', // optional: hide topbar
  });

  // ── Start server ──────────────────────────────────────────────────────
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const host = '0.0.0.0'; // Required for Render / Docker

  await app.listen(port, host);

  console.log(`🚀 EasyPost API running on http://${host}:${port}`);
  console.log(`📚 Swagger UI:     http://${host}:${port}/api-docs`);
  console.log(`🔥 Health check:   http://${host}:${port}/api/health`);
  console.log(`Env: ${process.env.NODE_ENV || 'unknown'}`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});