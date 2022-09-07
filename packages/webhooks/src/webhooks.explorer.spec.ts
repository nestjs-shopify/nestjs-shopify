import { ApplicationConfig } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ShopifyWebhooksExplorer } from './webhooks.explorer';
import { ShopifyWebhooksModule } from './webhooks.module';
import { ShopifyWebhookHandler } from './webhooks.interfaces';
import { WebhookHandler } from './webhooks.decorators';
import Shopify from '@shopify/shopify-api';

@WebhookHandler('PRODUCTS_CREATE')
class ProductsCreate extends ShopifyWebhookHandler {
  async handle(): Promise<void> {
    // do nothing
  }
}

@WebhookHandler('ORDERS_CREATE')
class OrdersCreate extends ShopifyWebhookHandler {
  async handle(): Promise<void> {
    // do nothing
  }
}

const webhookHandlers = [ProductsCreate, OrdersCreate];

describe('ShopifyWebhooksExplorer', () => {
  let service: ShopifyWebhooksExplorer;
  let appConfig: jest.Mocked<ApplicationConfig>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ShopifyWebhooksModule.forRoot({ path: '/my-path/' })],
      providers: [...webhookHandlers],
    })
      .overrideProvider(ApplicationConfig)
      .useValue({
        getGlobalPrefix: jest.fn(),
      })
      .compile();

    service = module.get(ShopifyWebhooksExplorer);
    appConfig = module.get(ApplicationConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('without global prefix', () => {
    beforeEach(() => {
      appConfig.getGlobalPrefix.mockReturnValue('');

      service.registerHandlers();
    });

    it('should register both webhook handlers', () => {
      expect(Shopify.Webhooks.Registry.webhookRegistry).toMatchObject({
        PRODUCTS_CREATE: expect.objectContaining({ path: '/my-path/' }),
        ORDERS_CREATE: expect.objectContaining({ path: '/my-path/' }),
      });
    });
  });

  describe('with global prefix', () => {
    describe('with slash', () => {
      beforeEach(() => {
        appConfig.getGlobalPrefix.mockReturnValue('test');

        service.registerHandlers();
      });

      it('should include prefix in webhook path', () => {
        expect(Shopify.Webhooks.Registry.webhookRegistry).toMatchObject({
          PRODUCTS_CREATE: expect.objectContaining({ path: '/test/my-path/' }),
          ORDERS_CREATE: expect.objectContaining({ path: '/test/my-path/' }),
        });
      });
    });

    describe('with slash', () => {
      beforeEach(() => {
        appConfig.getGlobalPrefix.mockReturnValue('/cool');

        service.registerHandlers();
      });

      it('should include prefix in webhook path', () => {
        expect(Shopify.Webhooks.Registry.webhookRegistry).toMatchObject({
          PRODUCTS_CREATE: expect.objectContaining({ path: '/cool/my-path/' }),
          ORDERS_CREATE: expect.objectContaining({ path: '/cool/my-path/' }),
        });
      });
    });
  });
});
