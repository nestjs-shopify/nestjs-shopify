import '@shopify/shopify-api/dist/adapters/node';
import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import { INestApplication } from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import * as request from 'supertest';
import { createTestApp } from '../helpers/app';

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
      await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'token')
        .expect(403);
    });
  });

  describe('authorized with online token', () => {
    const operation = 'MyQuery';
    const query = 'query MyQuery() {\n shop {\n id\n }\n}';

    beforeEach(() => {
      jest.spyOn(shopifyApi.session, 'getCurrent').mockResolvedValueOnce({
        id: 'token-id',
        accessToken: 'token',
        isOnline: true,
        shop: 'test.myshopify.io',
        state: '',
        expires: new Date(Date.now() + 1000),
        scope: 'test_scope',
        isActive: () => true,
      });

      graphqlProxySpy.mockResolvedValueOnce({
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ shop: { id: 'lol' } }),
      });
    });

    it('should return 200 ok', async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', 'token')
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
        .set('Authorization', 'token')
        .set('Content-Type', 'application/json')
        .send({
          operation,
          query,
        });

      expect(graphqlProxySpy).toHaveBeenCalledWith(
        expect.objectContaining({
          body: JSON.stringify({ operation, query }),
        })
      );
    });
  });
});
