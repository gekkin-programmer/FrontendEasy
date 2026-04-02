import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/modules/auth/auth.module';
import { PrismaModule } from '../src/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';

describe('Google Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '.env.test',
        }),
        PrismaModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/GET /api/auth/google should redirect to Google', () => {
    return request(app.getHttpServer())
      .get('/api/auth/google')
      .expect(302) // Redirect
      .expect('Location', /accounts\.google\.com/);
  });

  it('/GET /api/auth/google should accept workspaceId parameter', () => {
    return request(app.getHttpServer())
      .get('/api/auth/google?workspaceId=test-workspace')
      .expect(302);
  });

  it('/POST /api/auth/refresh should require refresh token', () => {
    return request(app.getHttpServer())
      .post('/api/auth/refresh')
      .send({})
      .expect(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
