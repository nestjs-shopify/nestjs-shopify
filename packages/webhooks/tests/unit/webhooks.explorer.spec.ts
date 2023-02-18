import '@shopify/shopify-api/adapters/node';
import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import { ApplicationConfig } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { Shopify } from '@shopify/shopify-api';
import { ShopifyWebhooksExplorer } from '../../src/webhooks.explorer';
import { ShopifyWebhooksModule } from '../../src/webhooks.module';
import { ShopifyWebhookHandler } from '../../src/webhooks.interfaces';
import { WebhookHandler } from '../../src/webhooks.decorators';
import { MockShopifyCoreModule } from '../helpers/mock-shopify-core-module';

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
  let shopifyApi: Shopify;
  let service: ShopifyWebhooksExplorer;
  let appConfig: jest.Mocked<ApplicationConfig>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MockShopifyCoreModule,
        ShopifyWebhooksModule.forRoot({ path: '/my-path/' }),
      ],
      providers: [...webhookHandlers],
    })
      .overrideProvider(ApplicationConfig)
      .useValue({
        getGlobalPrefix: jest.fn(),
      })
      .compile();

    service = module.get(ShopifyWebhooksExplorer);
    appConfig = module.get(ApplicationConfig);
    shopifyApi = module.get<Shopify>(SHOPIFY_API_CONTEXT);

    // We mock the webhooks call to make sure nothing gets registered
    jest
      .spyOn(shopifyApi.webhooks, 'register')
      .mockImplementation(() => Promise.resolve({}));
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
      expect(shopifyApi.webhooks.getHandlers('PRODUCTS_CREATE')).toEqual([
        expectedWebhook('/my-path/'),
      ]);

      expect(shopifyApi.webhooks.getHandlers('ORDERS_CREATE')).toEqual([
        expectedWebhook('/my-path/'),
      ]);
    });
  });

  describe('with global prefix', () => {
    describe('without slash', () => {
      beforeEach(() => {
        appConfig.getGlobalPrefix.mockReturnValue('test');

        service.registerHandlers();
      });

      it('should include prefix in webhook path', () => {
        expect(shopifyApi.webhooks.getHandlers('PRODUCTS_CREATE')).toEqual([
          expectedWebhook('/test/my-path/'),
        ]);

        expect(shopifyApi.webhooks.getHandlers('ORDERS_CREATE')).toEqual([
          expectedWebhook('/test/my-path/'),
        ]);
      });
    });

    describe('with slash', () => {
      beforeEach(() => {
        appConfig.getGlobalPrefix.mockReturnValue('/cool');

        service.registerHandlers();
      });

      it('should include prefix in webhook path', () => {
        expect(shopifyApi.webhooks.getHandlers('PRODUCTS_CREATE')).toEqual([
          expectedWebhook('/cool/my-path/'),
        ]);

        expect(shopifyApi.webhooks.getHandlers('ORDERS_CREATE')).toEqual([
          expectedWebhook('/cool/my-path/'),
        ]);
      });
    });
  });
});

function expectedWebhook(callbackUrl: string) {
  return {
    callback: expect.any(Function),
    callbackUrl,
    deliveryMethod: 'http' as const,
  };
}
