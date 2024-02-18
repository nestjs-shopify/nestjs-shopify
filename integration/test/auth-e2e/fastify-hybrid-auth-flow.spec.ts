import '@shopify/shopify-api/adapters/node';
import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { Shopify } from '@shopify/shopify-api';
import { FastifyAppModule } from '../../src/with-hybrid-auth/fastify-app.module';

const randomBytes = new Uint8Array(Buffer.from('random-bytes'));
const nonce = '470019581615';

jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  getRandomValues: () => randomBytes,
}));

jest.mock('isbot', () => ({
  default: jest.fn().mockReturnValue(false),
  __esModule: true,
}));

const TEST_SHOP = 'test.myshopify.io';
const HOST = Buffer.from(`https://${TEST_SHOP}/admin`).toString('base64url');

describe('Fastify: Hybrid Auth Flow (e2e)', () => {
  let app: NestFastifyApplication;
  let callbackSpy: jest.SpyInstance;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [FastifyAppModule],
    }).compile();

    app = await module
      .createNestApplication<NestFastifyApplication>(new FastifyAdapter())
      .init();

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
      const response = await app.inject({
        method: 'GET',
        url: '/online/auth',
        query: {
          shop: TEST_SHOP,
        },
      });

      expect(response.statusCode).toEqual(302);
    });

    it('redirects to oauth screen', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/online/auth',
        query: {
          shop: TEST_SHOP,
        },
      });

      expect(response.headers).toMatchObject({
        location: authRedirectUrl,
      });
    });
  });

  describe('with online callback', () => {
    const timestamp = Date.now().toString();
    const query = {
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
      const response = await app.inject({
        method: 'GET',
        url: '/online/callback',
        query,
      });

      expect(response.statusCode).toEqual(302);
      expect(callbackSpy).toHaveBeenCalledWith({
        rawRequest: expect.anything(),
        rawResponse: expect.anything(),
      });
    });

    it('redirects to default homepage', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/online/callback',
        query,
      });

      expect(response.headers).toMatchObject({
        location: `/?shop=${TEST_SHOP}&host=${HOST}`,
      });
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
      const response = await app.inject({
        method: 'GET',
        url: '/offline/auth',
        query: {
          shop: TEST_SHOP,
        },
      });

      expect(response.statusCode).toEqual(302);
    });

    it('redirects to oauth screen', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/offline/auth',
        query: {
          shop: TEST_SHOP,
        },
      });

      expect(response.statusCode).toEqual(302);
      expect(response.headers).toMatchObject({
        location: authRedirectUrl,
      });
    });
  });

  describe('with offline callback', () => {
    const timestamp = Date.now().toString();
    const query = {
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
      const response = await app.inject({
        method: 'GET',
        url: '/offline/callback',
        query,
      });

      expect(response.statusCode).toEqual(302);
      expect(callbackSpy).toHaveBeenCalledWith({
        rawRequest: expect.anything(),
        rawResponse: expect.anything(),
      });
    });

    it('redirects to default homepage', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/offline/callback',
        query,
      });

      expect(response.statusCode).toEqual(302);
      expect(response.headers).toMatchObject({
        location: `/?shop=${TEST_SHOP}&host=${HOST}`,
      });
    });
  });
});
