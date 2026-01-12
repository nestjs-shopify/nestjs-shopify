import '@shopify/shopify-api/adapters/node';
import {
  SHOPIFY_API_CONTEXT,
  SHOPIFY_API_SESSION_STORAGE,
} from '@nestjs-shopify/core';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  HttpResponseError,
  InvalidJwtError,
  RequestedTokenType,
  Session,
  Shopify,
} from '@shopify/shopify-api';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import combinate from 'combinate';

import { ExpressAppModule } from '../../src/with-token-exchange/express-app.module';
import { FastifyAppModule } from '../../src/with-token-exchange/fastify-app.module';
import { MemorySessionStorage } from '../../src/shopify-initializer/session-storage/memory.session-storage';
import { MyAfterAuthHandler } from '../../src/shopify-token-exchange/my-after-auth-handler';

const TEST_SHOP = 'test.myshopify.io';

interface GetSessionParams {
  expires: Date;
  sub: string;
}

const matrix = {
  framework: [
    {
      type: 'express',
      appModule: ExpressAppModule,
      init: (module: TestingModule) => module.createNestApplication().init(),
    },
    {
      type: 'fastify',
      appModule: FastifyAppModule,
      init: async (module: TestingModule) => {
        const app = module.createNestApplication<NestFastifyApplication>(
          new FastifyAdapter(),
        );
        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        return app;
      },
    },
  ],
  auth: [
    {
      type: 'online' as const,
      getSession: ({ expires, sub }: GetSessionParams) => {
        const session = new Session({
          id: `${TEST_SHOP}_${sub}`,
          isOnline: true,
          shop: TEST_SHOP,
          state: 'state',
          accessToken: 'accessToken',
          expires,
          scope: 'write_products',
        });
        return session;
      },
      tokenType: RequestedTokenType.OnlineAccessToken,
    },
    {
      type: 'offline' as const,
      getSession: () => {
        const session = new Session({
          id: `offline_${TEST_SHOP}`,
          isOnline: false,
          shop: TEST_SHOP,
          state: 'state',
          scope: 'write_products',
          accessToken: 'accessToken',
        });
        return session;
      },
      tokenType: RequestedTokenType.OfflineAccessToken,
    },
  ],
};

const testCases = combinate(matrix);

describe.each(testCases)(
  'Token Exchange (e2e) $framework.type $auth.type',
  ({ framework, auth }) => {
    let app: INestApplication;
    let shopifyApi: Shopify;
    let sessionStorage: jest.Mocked<MemorySessionStorage>;
    let tokenExchangeSpy: jest.SpiedFunction<
      typeof shopifyApi.auth.tokenExchange
    >;
    let afterAuthHandler: MyAfterAuthHandler;

    let exp: number;
    let session: Session;
    let token: string;

    const path = `/message/${auth.type}` as const;

    beforeEach(async () => {
      const module = await Test.createTestingModule({
        imports: [framework.appModule],
      })
        .overrideProvider(MemorySessionStorage)
        .useValue({
          loadSession: jest.fn(),
          storeSession: jest.fn(),
        })
        .overrideProvider(MyAfterAuthHandler)
        .useValue({
          afterAuth: jest.fn(),
        })
        .compile();

      app = await framework.init(module);
      shopifyApi = module.get(SHOPIFY_API_CONTEXT);
      sessionStorage = module.get(SHOPIFY_API_SESSION_STORAGE);
      tokenExchangeSpy = jest.spyOn(shopifyApi.auth, 'tokenExchange');
      afterAuthHandler = module.get(MyAfterAuthHandler);

      exp = Date.now() / 1000 + 3600;
      const jwtPayload = {
        sub: '1',
        dest: `https://${TEST_SHOP}`,
        iss: `https://${TEST_SHOP}/admin`,
        exp,
        nbf: 1234,
        iat: 1234,
        jti: '4321',
        sid: 'abc123',
      };

      session = auth.getSession({
        expires: new Date(exp * 1000),
        sub: jwtPayload.sub,
      });

      token = jwt.sign(jwtPayload, shopifyApi.config.apiSecretKey, {
        algorithm: 'HS256',
        audience: shopifyApi.config.apiKey,
      });
    });

    afterEach(async () => {
      jest.clearAllMocks();
      await app.close();
    });

    it(`GET ${path}, 403 missing header`, async () => {
      await request(app.getHttpServer())
        .get(`/message/${auth.type}`)
        .set({
          accepts: 'application/json',
        })
        .expect(403);
      expect(tokenExchangeSpy).not.toHaveBeenCalled();
      expect(sessionStorage.storeSession).not.toHaveBeenCalled();
      expect(afterAuthHandler.afterAuth).not.toHaveBeenCalled();
    });

    it(`GET ${path}, 403 invalid jwt`, async () => {
      await request(app.getHttpServer())
        .get(path)
        .set({
          accepts: 'application/json',
          authorization: `wrong`,
        })
        .expect(403);
      expect(tokenExchangeSpy).not.toHaveBeenCalled();
      expect(sessionStorage.storeSession).not.toHaveBeenCalled();
      expect(afterAuthHandler.afterAuth).not.toHaveBeenCalled();
    });

    it(`GET ${path}, valid session exists, responds with 200`, async () => {
      sessionStorage.loadSession.mockResolvedValueOnce(session);
      await request(app.getHttpServer())
        .get(path)
        .set({
          accepts: 'application/json',
          authorization: `Bearer ${token}`,
        })
        .expect(200);
      expect(tokenExchangeSpy).not.toHaveBeenCalled();
      expect(sessionStorage.storeSession).not.toHaveBeenCalled();
      expect(afterAuthHandler.afterAuth).not.toHaveBeenCalled();
    });

    describe('perform token exchange', () => {
      let newSession: Session;
      beforeEach(() => {
        newSession = new Session(session.toObject());

        tokenExchangeSpy.mockImplementation(() =>
          Promise.resolve({ session: newSession }),
        );
      });

      async function performTokenExchangeTest() {
        await request(app.getHttpServer())
          .get(path)
          .set({
            accepts: 'application/json',
            authorization: `Bearer ${token}`,
          })
          .expect(200);

        expect(tokenExchangeSpy).toHaveBeenCalledWith({
          requestedTokenType: auth.tokenType,
          sessionToken: token,
          shop: TEST_SHOP,
        });

        expect(sessionStorage.storeSession).toHaveBeenCalledWith(newSession);
        expect(afterAuthHandler.afterAuth).toHaveBeenCalledWith({
          session: newSession,
          sessionToken: token,
        });
      }

      it(`GET ${path} with no session yet in storage, triggers token exchange, responds with 200`, async () => {
        await performTokenExchangeTest();
      });

      // test only makes sense for online auth since offline sessions don't expire
      if (auth.type === 'online') {
        it(`GET ${path} with expired session, triggers token exchange, responds with 200`, async () => {
          session.expires = new Date(Date.now() - 60 * 1000);
          sessionStorage.loadSession.mockResolvedValueOnce(session);
          await performTokenExchangeTest();
        });
      }
    });

    it.each([
      { type: 'InvalidJwtError', error: new InvalidJwtError() },
      {
        type: 'HttpResponseError',
        error: new HttpResponseError({
          code: 400,
          body: { error: 'invalid_subject_token' },
          message: '',
          statusText: '',
        }),
      },
    ])('token exchange fails with $type, 401', async ({ error }) => {
      tokenExchangeSpy.mockRejectedValueOnce(error);
      const response = await request(app.getHttpServer())
        .get(path)
        .set({
          accepts: 'application/json',
          authorization: `Bearer ${token}`,
        })
        .expect(401);
      expect(response.headers['x-shopify-retry-invalid-session-request']).toBe(
        '1',
      );
      expect(sessionStorage.storeSession).not.toHaveBeenCalled();
      expect(afterAuthHandler.afterAuth).not.toHaveBeenCalled();
    });

    it('token exchange fails with any other error, 500', async () => {
      tokenExchangeSpy.mockRejectedValueOnce(new Error());
      await request(app.getHttpServer())
        .get(path)
        .set({
          accepts: 'application/json',
          authorization: `Bearer ${token}`,
        })
        .expect(500);
      expect(sessionStorage.storeSession).not.toHaveBeenCalled();
      expect(afterAuthHandler.afterAuth).not.toHaveBeenCalled();
    });
  },
);
