import '@shopify/shopify-api/dist/adapters/node';
import { INestApplication } from '@nestjs/common';
import { ContextIdFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ShopifyHeader } from '@shopify/shopify-api';
import { createHmac } from 'crypto';
import * as request from 'supertest';
import { AppModule } from '../../src/with-webhooks/app.module';

function hmac(secret: string, body: string) {
  return createHmac('sha256', secret).update(body, 'utf8').digest('base64');
}

const TEST_SHOP = 'test.myshopify.io';

describe('Webhooks (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication({ rawBody: true });
    await app.init();

    const contextId = ContextIdFactory.create();
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);
  });

  afterEach(async () => {
    await app.close();
    jest.resetAllMocks();
  });

  describe('POST /webhooks', () => {
    it('successfully processes PRODUCTS_CREATE webhook', async () => {
      const rawBody = '{"amount": 0.0}';
      await request(app.getHttpServer())
        .post('/webhooks')
        .set({
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Topic]: 'products/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
        })
        .send(rawBody)
        .expect(200);
    });

    it('successfully processes PRODUCTS_UPDATE webhook', async () => {
      const rawBody = '{"amount": 0.1}';
      await request(app.getHttpServer())
        .post('/webhooks')
        .set({
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Topic]: 'products/update',
          [ShopifyHeader.Domain]: TEST_SHOP,
        })
        .send(rawBody)
        .expect(200);
    });

    it('throws bad request if hmac header missing', async () => {
      const rawBody = '{"amount": 1.0}';
      await request(app.getHttpServer())
        .post('/webhooks')
        .set({
          'content-type': 'application/json',
          [ShopifyHeader.Topic]: 'products/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
        })
        .send(rawBody)
        .expect(400);
    });

    it('throws bad request if topic header missing', async () => {
      const rawBody = '{"amount": 2.0}';
      await request(app.getHttpServer())
        .post('/webhooks')
        .set({
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Domain]: TEST_SHOP,
        })
        .send(rawBody)
        .expect(400);
    });

    it('throws bad request if domain header missing', async () => {
      const rawBody = '{"amount": 3.0}';
      await request(app.getHttpServer())
        .post('/webhooks')
        .set({
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Topic]: 'products/create',
        })
        .send(rawBody)
        .expect(400);
    });

    it('throws unauthorized if hmac signed with invalid key', async () => {
      const rawBody = '{"amount": 4.0}';
      await request(app.getHttpServer())
        .post('/webhooks')
        .set({
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('wrong', rawBody),
          [ShopifyHeader.Topic]: 'products/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
        })
        .send(rawBody)
        .expect(401);
    });

    it('throws unauthorized if hmac signed with wrong body', async () => {
      const rawBody = '{"amount": 5.0}';
      await request(app.getHttpServer())
        .post('/webhooks')
        .set({
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', '{"amount": 5}'),
          [ShopifyHeader.Topic]: 'products/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
        })
        .send(rawBody)
        .expect(401);
    });

    it('throws not found if graphql topic not registered', async () => {
      const rawBody = '{"amount": 6.0}';
      await request(app.getHttpServer())
        .post('/webhooks')
        .set({
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Topic]: 'orders/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
        })
        .send(rawBody)
        .expect(404);
    });
  });
});
