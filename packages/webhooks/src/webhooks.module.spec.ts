import { PATH_METADATA } from '@nestjs/common/constants';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { ShopifyWebhooksController } from './webhooks.controller';
import { ShopifyWebhooksModule } from './webhooks.module';

describe('ShopifyWebhookModule', () => {
  let moduleRef: TestingModule;
  const reflector = new Reflector();

  afterEach(async () => {
    await moduleRef.close();
  });

  describe('#forRoot', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyWebhooksModule.forRoot({
            path: '/mywebhooks',
          }),
        ],
      }).compile();

      await moduleRef.init();
    });

    it('should override webhook controller path', async () => {
      expect(reflector.get(PATH_METADATA, ShopifyWebhooksController)).toEqual(
        '/mywebhooks'
      );
    });
  });

  describe('#forRootAsync', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyWebhooksModule.forRootAsync({
            useClass: class Testing {
              createShopifyWebhookOptions() {
                return {
                  path: '/mywebhooks2',
                };
              }
            },
          }),
        ],
      }).compile();

      await moduleRef.init();
    });

    it('should add webhook to registry', async () => {
      expect(reflector.get(PATH_METADATA, ShopifyWebhooksController)).toEqual(
        '/mywebhooks2'
      );
    });
  });
});
