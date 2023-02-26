import '@shopify/shopify-api/adapters/node';
import { Test } from '@nestjs/testing';
import { WebhookHandler } from '../../src/webhooks.decorators';
import { ShopifyWebhooksMetadataAccessor } from '../../src/webhooks-metadata.accessor';
import { ShopifyWebhooksModule } from '../../src/webhooks.module';
import { MockShopifyCoreModule } from '../helpers/mock-shopify-core-module';
import { Scope } from '@nestjs/common';

@WebhookHandler('PRODUCTS_CREATE')
class Handler1 {}

@WebhookHandler({ topic: 'PRODUCTS_UPDATE', scope: Scope.TRANSIENT })
class Handler2 {}

class NonHandler3 {}

describe('ShopifyWebhooksMetadataAccessor', () => {
  let accessor: ShopifyWebhooksMetadataAccessor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MockShopifyCoreModule,
        ShopifyWebhooksModule.forRoot({ path: 'metadata' }),
      ],
    }).compile();

    accessor = module.get(ShopifyWebhooksMetadataAccessor);
  });

  describe('.getShopifyWebhooksHandlerMetadata', () => {
    it('should return an object for `Handler1`', () => {
      const metadata = accessor.getShopifyWebhooksHandlerMetadata(Handler1);

      expect(metadata).toEqual({
        topic: 'PRODUCTS_CREATE',
      });
    });

    it('should return an object with scope for `Handler2', () => {
      const metadata = accessor.getShopifyWebhooksHandlerMetadata(Handler2);

      expect(metadata).toEqual({
        topic: 'PRODUCTS_UPDATE',
        scope: Scope.TRANSIENT,
      });
    });

    it('should return undefined for `NonHandler3` class', () => {
      const metadata = accessor.getShopifyWebhooksHandlerMetadata(NonHandler3);

      expect(metadata).toBeUndefined();
    });
  });

  describe('.isShopifyWebhookHandler', () => {
    it('should return true for `Handler1`', () => {
      const isHandler = accessor.isShopifyWebhookHandler(Handler1);

      expect(isHandler).toBe(true);
    });

    it('should return true for `Handler2', () => {
      const isHandler = accessor.isShopifyWebhookHandler(Handler2);

      expect(isHandler).toBe(true);
    });

    it('should return false for `NonHandler3`', () => {
      const isHandler = accessor.isShopifyWebhookHandler(NonHandler3);

      expect(isHandler).toBe(false);
    });
  });
});
