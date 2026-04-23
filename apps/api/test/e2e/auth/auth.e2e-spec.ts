import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from '../../utils/app-instance';
import { cleanDatabase } from '../../utils/database-cleaner';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  it('/auth/register (POST) - Success', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'new@darija.ma', password: 'Password123!', username: 'darija_king' })
      .expect(201);
  });

  afterAll(async () => {
    await app.close();
  });
});