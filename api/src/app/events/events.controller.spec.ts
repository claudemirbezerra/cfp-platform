import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { createValidationPipe } from '../validation-pipe';
import { EventsService } from './events.service';

describe('POST /api/events', () => {
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
    nome: 'Conferência Tech 2026',
    endereco: 'Av. Paulista, 1000 - São Paulo, SP',
    capacidade: 300,
    data: '2026-11-20',
  };

  it('rejects a missing nome with 400 and does not store it', async () => {
    const body = {
      endereco: validBody.endereco,
      capacidade: validBody.capacidade,
      data: validBody.data,
    };

    await request(app.getHttpServer()).post('/api/events').send(body).expect(400);

    expect(app.get(EventsService).findAll()).toEqual([]);
  });

  it('rejects an invalid capacidade (string or negative) with 400 and does not store it', async () => {
    await request(app.getHttpServer())
      .post('/api/events')
      .send({ ...validBody, capacidade: -10 })
      .expect(400);

    expect(app.get(EventsService).findAll()).toEqual([]);
  });

  it('rejects an unknown field with 400 and does not store it', async () => {
    await request(app.getHttpServer())
      .post('/api/events')
      .send({ ...validBody, extra: 'unknown-field' })
      .expect(400);

    expect(app.get(EventsService).findAll()).toEqual([]);
  });

  it('creates an event from a valid body without id', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/events')
      .send(validBody)
      .expect(201);

    expect(response.body).toEqual({
      id: expect.any(String),
      nome: validBody.nome,
      endereco: validBody.endereco,
      capacidade: validBody.capacidade,
      data: validBody.data,
    });
    expect(response.body.id).not.toBe('');
    expect(app.get(EventsService).findAll()).toEqual([response.body]);
  });
});

describe('GET /api/events', () => {
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
    nome: 'Conferência Tech 2026',
    endereco: 'Av. Paulista, 1000 - São Paulo, SP',
    capacidade: 300,
    data: '2026-11-20',
  };

  it('returns 200 and an empty array when no events have been created', async () => {
    const response = await request(app.getHttpServer()).get('/api/events').expect(200);

    expect(response.body).toEqual([]);
  });

  it('returns the stored event and a second read returns the same body', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/events')
      .send(validBody)
      .expect(201);

    const stored = {
      id: created.body.id,
      nome: validBody.nome,
      endereco: validBody.endereco,
      capacidade: validBody.capacidade,
      data: validBody.data,
    };

    const first = await request(app.getHttpServer()).get('/api/events').expect(200);
    expect(first.body).toEqual([stored]);

    const second = await request(app.getHttpServer()).get('/api/events').expect(200);
    expect(second.body).toEqual(first.body);
  });
});
