import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { createValidationPipe } from '../validation-pipe';
import { SpeakersService } from './speakers.service';

describe('POST /api/speakers', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(createValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  const validBody = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    talkTitle: 'Notes on the Analytical Engine',
    isGDE: true,
  };

  it('rejects a missing talk title with 400 and does not store it', async () => {
    const body = {
      name: validBody.name,
      email: validBody.email,
      isGDE: validBody.isGDE,
    };

    await request(app.getHttpServer()).post('/api/speakers').send(body).expect(400);

    expect(app.get(SpeakersService).findAll()).toEqual([]);
  });

  it('rejects an invalid email with 400 and does not store it', async () => {
    await request(app.getHttpServer())
      .post('/api/speakers')
      .send({ ...validBody, email: 'not-an-email' })
      .expect(400);

    expect(app.get(SpeakersService).findAll()).toEqual([]);
  });

  it('rejects a non-boolean isGDE with 400 and does not store it', async () => {
    await request(app.getHttpServer())
      .post('/api/speakers')
      .send({ ...validBody, isGDE: 'true' })
      .expect(400);

    expect(app.get(SpeakersService).findAll()).toEqual([]);
  });

  it('rejects an unknown field with 400 and does not store it', async () => {
    await request(app.getHttpServer())
      .post('/api/speakers')
      .send({ ...validBody, extra: 'not-in-the-contract' })
      .expect(400);

    expect(app.get(SpeakersService).findAll()).toEqual([]);
  });

  it('creates a speaker from a valid body without id', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/speakers')
      .send(validBody)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      name: validBody.name,
      email: validBody.email,
      talkTitle: validBody.talkTitle,
      isGDE: validBody.isGDE,
    });
    expect(response.body.id).not.toBe('');
    expect(app.get(SpeakersService).findAll()).toEqual([response.body]);
  });

  it('keeps the existing hello route', async () => {
    await request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect({ message: 'Hello API' });
  });
});
