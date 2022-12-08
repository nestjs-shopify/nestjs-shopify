import '@shopify/shopify-api/adapters/node';
import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import { INestApplication } from '@nestjs/common';
import { Session, Shopify } from '@shopify/shopify-api';
import * as request from 'supertest';
import { createTestApp } from '../helpers/app';
import { mockSessionStorage } from '../helpers/mock-session-storage';

describe('GraphQL proxy', () => {
  let app: INestApplication;
  let shopifyApi: Shopify;
  let graphqlProxySpy: jest.SpyInstance;

  beforeEach(async () => {
    app = await createTestApp();
    await app.init();

    shopifyApi = app.get(SHOPIFY_API_CONTEXT);

    graphqlProxySpy = jest.spyOn(shopifyApi.clients, 'graphqlProxy');
  });

  describe('unauthorized', () => {
    it('should return 403 forbidden if token missing', async () => {
      await request(app.getHttpServer()).post('/graphql').expect(403);
    });

    it('should return 403 forbidden if token is not in session storage', async () => {
      jest
        .spyOn(shopifyApi.session, 'getCurrentId')
        .mockResolvedValueOnce('token-id');

      await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer token')
        .expect(403);
    });
  });

  describe('authorized with online token', () => {
    const operation = 'MyQuery';
    const query = 'query MyQuery() {\n shop {\n id\n }\n}';
    const session = {
      id: 'token-id',
      accessToken: 'token',
      isOnline: true,
      shop: 'test.myshopify.io',
      state: '',
      expires: new Date(Date.now() + 1000),
      scope: 'test_scope',
      isActive: () => true,
    } as unknown as Session;

    beforeEach(() => {
      jest
        .spyOn(shopifyApi.session, 'getCurrentId')
        .mockResolvedValueOnce('token-id');
      mockSessionStorage.loadSession.mockResolvedValueOnce(session);

      graphqlProxySpy.mockResolvedValueOnce({
        headers: { 'content-type': 'application/json' },
        rawBody: JSON.stringify({ shop: { id: 'lol' } }),
        session,
      });
    });

    it('should return 200 ok', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer token')
        .set('Content-Type', 'application/json')
        .send({
          operation,
          query,
        })
        .expect(200);
    });

    it('proxy raw request', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'Bearer token')
        .set('Content-Type', 'application/json')
        .send({
          operation,
          query,
        });

      expect(graphqlProxySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          rawBody: { operation, query },
        })
      );
    });
  });
});
