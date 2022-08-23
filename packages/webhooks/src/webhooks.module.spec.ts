import { Test, TestingModule } from '@nestjs/testing';
import Shopify from '@shopify/shopify-api';
import { WebhookHandler } from './webhooks.decorators';
import { ShopifyWebhookHandler } from './webhooks.interfaces';
import { ShopifyWebhooksModule } from './webhooks.module';

const mockHandle = jest.fn();

@WebhookHandler('CUSTOMERS_CREATE')
class CustomersCreate implements ShopifyWebhookHandler {
  async handle(shop: string, body: unknown): Promise<void> {
    mockHandle(shop, body);
  }
}

describe('ShopifyWebhookModule', () => {
  let moduleRef: TestingModule;

  describe('#forRoot', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyWebhooksModule.forRoot({
            path: '/mywebhooks',
          }),
        ],
        providers: [CustomersCreate],
      }).compile();

      await moduleRef.init();
    });

    afterEach(async () => {
      await moduleRef.close();
    });

    it('should add webhook to registry', async () => {
      expect(
        Shopify.Webhooks.Registry.webhookRegistry['CUSTOMERS_CREATE']
      ).toHaveProperty('path', '/mywebhooks');
    });
  });

  describe('#forRootAsync', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyWebhooksModule.forRootAsync({
            useFactory: () => ({
              path: '/mywebhooks2',
            }),
          }),
        ],
        providers: [CustomersCreate],
      }).compile();

      await moduleRef.init();
    });

    afterEach(async () => {
      await moduleRef.close();
    });

    it('should add webhook to registry', async () => {
      expect(
        Shopify.Webhooks.Registry.webhookRegistry['CUSTOMERS_CREATE']
      ).toHaveProperty('path', '/mywebhooks2');
    });
  });
});
