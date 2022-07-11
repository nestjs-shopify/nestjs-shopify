import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import Shopify, { SessionInterface } from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';
import * as jwt from 'jsonwebtoken';
import * as request from 'supertest';
import { AppModule } from '../../src/with-hybrid-auth/app.module';

const TEST_SHOP = 'test.myshopify.io';
const HOST = Buffer.from(`https://${TEST_SHOP}/admin`).toString('base64url');

describe('Hybrid Authz (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await module.createNestApplication().init();
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

    const session = new Session(
      `${TEST_SHOP}_${jwtPayload.sub}`,
      TEST_SHOP,
      'state',
      true
    );
    session.scope = 'write_products';
    session.accessToken = 'asdf';

    let token: string;

    beforeEach(async () => {
      await Shopify.Context.SESSION_STORAGE.storeSession(session);

      token = jwt.sign(jwtPayload, Shopify.Context.API_SECRET_KEY, {
        algorithm: 'HS256',
        audience: Shopify.Context.API_KEY,
      });
    });

    it('GET /message/online', async () => {
      const res = await request(app.getHttpServer())
        .get('/message/online')
        .set({
          accepts: 'application/json',
          authorization: `Bearer ${token}`,
        })
        .expect(200);
    });
  });
});
