import '@shopify/shopify-api/adapters/node';
import { ContextIdFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { ShopifyHeader } from '@shopify/shopify-api';
import { createHmac } from 'crypto';
import { AppModule } from '../../src/with-webhooks/app.module';

function hmac(secret: string, body: string) {
  return createHmac('sha256', secret).update(body, 'utf8').digest('base64');
}

const TEST_SHOP = 'test.myshopify.io';

describe('Fastify: Webhooks (e2e)', () => {
  let app: NestFastifyApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication(new FastifyAdapter(), { rawBody: true });
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
      const response = await app.inject({
        url: '/webhooks',
        body: rawBody,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Topic]: 'products/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
          [ShopifyHeader.WebhookId]: '1',
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('successfully processes PRODUCTS_UPDATE webhook', async () => {
      const rawBody = '{"amount": 0.1}';
      const response = await app.inject({
        url: '/webhooks',
        body: rawBody,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Topic]: 'products/update',
          [ShopifyHeader.Domain]: TEST_SHOP,
          [ShopifyHeader.WebhookId]: '2',
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('throws bad request if hmac header missing', async () => {
      const rawBody = '{"amount": 1.0}';
      const response = await app.inject({
        url: '/webhooks',
        body: rawBody,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [ShopifyHeader.Topic]: 'products/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
          [ShopifyHeader.WebhookId]: '3',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('throws bad request if topic header missing', async () => {
      const rawBody = '{"amount": 2.0}';
      const response = await app.inject({
        url: '/webhooks',
        body: rawBody,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Domain]: TEST_SHOP,
          [ShopifyHeader.WebhookId]: '4',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('throws bad request if domain header missing', async () => {
      const rawBody = '{"amount": 3.0}';
      const response = await app.inject({
        url: '/webhooks',
        body: rawBody,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Topic]: 'products/create',
          [ShopifyHeader.WebhookId]: '5',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('throws bad request if webhook id header missing', async () => {
      const rawBody = '{"amount": 3.0}';
      const response = await app.inject({
        url: '/webhooks',
        body: rawBody,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Topic]: 'products/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('throws unauthorized if hmac signed with invalid key', async () => {
      const rawBody = '{"amount": 4.0}';
      const response = await app.inject({
        url: '/webhooks',
        body: rawBody,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('wrong', rawBody),
          [ShopifyHeader.Topic]: 'products/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
          [ShopifyHeader.WebhookId]: '6',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('throws unauthorized if hmac signed with wrong body', async () => {
      const rawBody = '{"amount": 5.0}';
      const response = await app.inject({
        url: '/webhooks',
        body: rawBody,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', '{"amount": 5}'),
          [ShopifyHeader.Topic]: 'products/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
          [ShopifyHeader.WebhookId]: '7',
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it('throws not found if graphql topic not registered', async () => {
      const rawBody = '{"amount": 6.0}';
      const response = await app.inject({
        url: '/webhooks',
        body: rawBody,
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          [ShopifyHeader.Hmac]: hmac('bar', rawBody),
          [ShopifyHeader.Topic]: 'orders/create',
          [ShopifyHeader.Domain]: TEST_SHOP,
          [ShopifyHeader.WebhookId]: '8',
        },
      });

      expect(response.statusCode).toBe(404);
    });
  });
});
