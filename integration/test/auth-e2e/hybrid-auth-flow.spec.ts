import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import Shopify, { AuthQuery } from '@shopify/shopify-api';
import { IncomingMessage, ServerResponse } from 'http';
import * as request from 'supertest';
import { AppModule } from '../../src/with-hybrid-auth/app.module';

const TEST_SHOP = 'test.myshopify.io';
const HOST = Buffer.from(`https://${TEST_SHOP}/admin`).toString('base64url');

const authSpy = jest.spyOn(Shopify.Auth, 'beginAuth');
const callbackSpy = jest.spyOn(Shopify.Auth, 'validateAuthCallback');

describe('Hybrid Auth Flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await module.createNestApplication().init();
  });

  afterEach(() => {
    jest.resetAllMocks();
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
      '&redirect_uri=https%3A%2F%2Flocalhost%3A8082online%2Fcallback' +
      `&state=random-nonce` +
      '&grant_options%5B%5D=per-user';

    beforeEach(() => {
      authSpy.mockResolvedValueOnce(authRedirectUrl);
    });

    it('calls Shopify.Auth.beginAuth with correct params', async () => {
      await request(app.getHttpServer())
        .get('/online/auth')
        .query({
          shop: TEST_SHOP,
        })
        .expect(302);

      expect(authSpy).toHaveBeenCalledWith(
        expect.any(IncomingMessage),
        expect.any(ServerResponse),
        TEST_SHOP,
        expect.stringContaining('/online/callback'),
        true
      );
    });

    it('redirects to oauth screen', async () => {
      const res = await request(app.getHttpServer())
        .get('/online/auth')
        .query({
          shop: TEST_SHOP,
        })
        .expect(302);

      expect(res.headers.location).toEqual(authRedirectUrl);
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
        id: 'sessionid',
        isActive: () => true,
        isOnline: true,
        shop: TEST_SHOP,
        state: 'nonce',
        accessToken: 'spp_accesstoken',
        scope: 'write_products',
      });
    });

    it('calls Shopify.Auth.validateAuthCallback with correct params', async () => {
      await request(app.getHttpServer())
        .get('/online/callback')
        .query(query)
        .expect(302);

      expect(callbackSpy).toHaveBeenCalledWith(
        expect.any(IncomingMessage),
        expect.any(ServerResponse),
        query
      );
    });

    it('redirects to default homepage', async () => {
      const res = await request(app.getHttpServer())
        .get('/online/callback')
        .query(query)
        .expect(302);

      expect(res.headers.location).toEqual(`/?shop=${TEST_SHOP}&host=${HOST}`);
    });
  });

  describe('with offline auth', () => {
    const authRedirectUrl =
      `https://${TEST_SHOP}` +
      '/admin/oauth/authorize' +
      '?client_id=foo' +
      '&scope=write_products' +
      '&redirect_uri=https%3A%2F%2Flocalhost%3A8082offline%2Fcallback' +
      `&state=random-nonce`;

    beforeEach(() => {
      authSpy.mockResolvedValueOnce(authRedirectUrl);
    });

    it('calls Shopify.Auth.beginAuth with correct params', async () => {
      await request(app.getHttpServer())
        .get('/offline/auth')
        .query({
          shop: TEST_SHOP,
        })
        .expect(302);

      expect(authSpy).toHaveBeenCalledWith(
        expect.any(IncomingMessage),
        expect.any(ServerResponse),
        TEST_SHOP,
        expect.stringContaining('/offline/callback'),
        false
      );
    });

    it('redirects to oauth screen', async () => {
      const res = await request(app.getHttpServer())
        .get('/offline/auth')
        .query({
          shop: TEST_SHOP,
        })
        .expect(302);

      expect(res.headers.location).toEqual(authRedirectUrl);
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
        id: 'sessionid',
        isActive: () => true,
        isOnline: false,
        shop: TEST_SHOP,
        state: 'nonce',
        accessToken: 'spk_accesstoken',
        scope: 'write_products',
      });
    });

    it('calls Shopify.Auth.validateAuthCallback with correct params', async () => {
      await request(app.getHttpServer())
        .get('/offline/callback')
        .query(query)
        .expect(302);

      expect(callbackSpy).toHaveBeenCalledWith(
        expect.any(IncomingMessage),
        expect.any(ServerResponse),
        query
      );
    });

    it('redirects to default homepage', async () => {
      const res = await request(app.getHttpServer())
        .get('/offline/callback')
        .query(query)
        .expect(302);

      expect(res.headers.location).toEqual(`/?shop=${TEST_SHOP}&host=${HOST}`);
    });
  });
});
