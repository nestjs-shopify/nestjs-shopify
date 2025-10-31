import '@shopify/shopify-api/adapters/node';
import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthQuery, Shopify } from '@shopify/shopify-api';
import { IncomingMessage, ServerResponse } from 'http';
import request from 'supertest';
import { ExpressAppModule } from '../../src/with-hybrid-auth/express-app.module';

const randomBytes = new Uint8Array(Buffer.from('random-bytes'));
const nonce = '470019581615';

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  getRandomValues: () => randomBytes,
}));

const TEST_SHOP = 'test.myshopify.io';
const HOST = Buffer.from(`https://${TEST_SHOP}/admin`).toString('base64url');

describe('Hybrid Auth Flow (e2e)', () => {
  let app: INestApplication;
  let callbackSpy: jest.SpyInstance;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ExpressAppModule],
    }).compile();

    app = await module.createNestApplication().init();

    const shopifyApi = app.get<Shopify>(SHOPIFY_API_CONTEXT);
    callbackSpy = jest.spyOn(shopifyApi.auth, 'callback');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('with online auth', () => {
    const authRedirectUrl =
      `https://${TEST_SHOP}` +
      '/admin/oauth/authorize' +
      '?client_id=foo' +
      '&scope=write_products' +
      '&redirect_uri=https%3A%2F%2Flocalhost%3A8082%2Fonline%2Fcallback' +
      `&state=${nonce}` +
      '&grant_options%5B%5D=per-user';

    it('calls shopify auth begin with correct params', async () => {
      await request(app.getHttpServer())
        .get('/online/auth')
        .query({
          shop: TEST_SHOP,
        })
        .expect(302);
    });

    it('redirects to oauth screen', async () => {
      const res = await request(app.getHttpServer())
        .get('/online/auth')
        .query({
          shop: TEST_SHOP,
        })
        .expect(302);

      expect(res.headers['location']).toEqual(authRedirectUrl);
    });
  });

  describe('with online callback', () => {
    const timestamp = Date.now().toString();
    const query: AuthQuery = {
      shop: TEST_SHOP,
      host: HOST,
      timestamp: timestamp,
      hmac: 'foobar',
      state: 'nonce',
      code: 'spa_authcode',
    };

    beforeEach(() => {
      callbackSpy.mockResolvedValueOnce({
        headers: {},
        session: {
          id: 'sessionid',
          isActive: () => true,
          isOnline: true,
          shop: TEST_SHOP,
          state: 'nonce',
          accessToken: 'spp_accesstoken',
          scope: 'write_products',
        },
      });
    });

    it('calls shopify auth callback with correct params', async () => {
      await request(app.getHttpServer())
        .get('/online/callback')
        .query(query)
        .expect(302);

      expect(callbackSpy).toHaveBeenCalledWith({
        rawRequest: expect.any(IncomingMessage),
        rawResponse: expect.any(ServerResponse),
      });
    });

    it('redirects to default homepage', async () => {
      const res = await request(app.getHttpServer())
        .get('/online/callback')
        .query(query)
        .expect(302);

      expect(res.headers['location']).toEqual(
        `/?shop=${TEST_SHOP}&host=${HOST}`,
      );
    });
  });

  describe('with offline auth', () => {
    const authRedirectUrl =
      `https://${TEST_SHOP}` +
      '/admin/oauth/authorize' +
      '?client_id=foo' +
      '&scope=write_products' +
      '&redirect_uri=https%3A%2F%2Flocalhost%3A8082%2Foffline%2Fcallback' +
      `&state=${nonce}` +
      '&grant_options%5B%5D=';

    it('calls shopify auth begin with correct params', async () => {
      await request(app.getHttpServer())
        .get('/offline/auth')
        .query({
          shop: TEST_SHOP,
        })
        .expect(302);
    });

    it('redirects to oauth screen', async () => {
      const res = await request(app.getHttpServer())
        .get('/offline/auth')
        .query({
          shop: TEST_SHOP,
        })
        .expect(302);

      expect(res.headers['location']).toEqual(authRedirectUrl);
    });
  });

  describe('with offline callback', () => {
    const timestamp = Date.now().toString();
    const query: AuthQuery = {
      shop: TEST_SHOP,
      host: HOST,
      timestamp: timestamp,
      hmac: 'foobar',
      state: 'nonce',
      code: 'spa_authcode',
    };

    beforeEach(() => {
      callbackSpy.mockResolvedValueOnce({
        headers: {},
        session: {
          id: 'sessionid',
          isActive: () => true,
          isOnline: false,
          shop: TEST_SHOP,
          state: 'nonce',
          accessToken: 'spk_accesstoken',
          scope: 'write_products',
        },
      });
    });

    it('calls shopify auth callback with correct params', async () => {
      await request(app.getHttpServer())
        .get('/offline/callback')
        .query(query)
        .expect(302);

      expect(callbackSpy).toHaveBeenCalledWith({
        rawRequest: expect.any(IncomingMessage),
        rawResponse: expect.any(ServerResponse),
      });
    });

    it('redirects to default homepage', async () => {
      const res = await request(app.getHttpServer())
        .get('/offline/callback')
        .query(query)
        .expect(302);

      expect(res.headers['location']).toEqual(
        `/?shop=${TEST_SHOP}&host=${HOST}`,
      );
    });
  });
});
