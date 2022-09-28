import '@shopify/shopify-api/dist/adapters/node';
import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Session, Shopify } from '@shopify/shopify-api';
import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';
import { AppModule } from '../../src/with-hybrid-auth/app.module';

const TEST_SHOP = 'test.myshopify.io';

describe('Hybrid Authz (e2e)', () => {
  let app: INestApplication;
  let shopifyApi: Shopify;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await module.createNestApplication().init();
    shopifyApi = module.get(SHOPIFY_API_CONTEXT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('online authenticated', () => {
    const jwtPayload = {
      sub: '1',
      dest: `https://${TEST_SHOP}`,
      iss: `https://${TEST_SHOP}/admin`,
      exp: Date.now() / 1000 + 3600,
      nbf: 1234,
      iat: 1234,
      jti: '4321',
      sid: 'abc123',
    };

    const session = new Session({
      id: `${TEST_SHOP}_${jwtPayload.sub}`,
      isOnline: true,
      shop: TEST_SHOP,
      state: 'state',
      accessToken: 'asdf',
      expires: new Date(jwtPayload.exp * 1000),
      scope: 'write_products',
    });

    let token: string;

    beforeEach(async () => {
      await shopifyApi.config.sessionStorage.storeSession(session);

      token = jwt.sign(jwtPayload, shopifyApi.config.apiSecretKey, {
        algorithm: 'HS256',
        audience: shopifyApi.config.apiKey,
      });
    });

    it('GET /message/online, 200', async () => {
      await request(app.getHttpServer())
        .get('/message/online')
        .set({
          accepts: 'application/json',
          authorization: `Bearer ${token}`,
        })
        .expect(200);
    });

    it('GET /message/online, 403 expired', async () => {
      jest
        .useFakeTimers()
        .setSystemTime(new Date((jwtPayload.exp + 10) * 1000));

      const res = await request(app.getHttpServer())
        .get('/message/online')
        .set({
          accepts: 'application/json',
          authorization: `Bearer ${token}`,
        })
        .expect(403);

      expect(
        res.headers['x-shopify-api-request-failure-reauthorize-url']
      ).toMatch(`/online/auth?shop=${TEST_SHOP}`);

      jest.useRealTimers();
    });
  });
});
