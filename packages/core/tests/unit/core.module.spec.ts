import '@shopify/shopify-api/adapters/node';
import { Test, TestingModule } from '@nestjs/testing';
import { Shopify } from '@shopify/shopify-api';
import { ShopifyCoreModule } from '../../src/core.module';
import {
  SHOPIFY_API_CONTEXT,
  SHOPIFY_API_SESSION_STORAGE,
} from '../../src/core.constants';
import { SessionStorage } from '../../src/core.interfaces';
import {
  mockedShopifyCoreOptions,
  MockShopifyCoreModule,
} from '../helpers/mock-shopify-core-module';

describe('ShopifyCoreModule', () => {
  let moduleRef: TestingModule;

  describe('#forRoot', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [MockShopifyCoreModule],
      }).compile();
    });

    it('should provide Shopify context', () => {
      const shopify = moduleRef.get<Shopify>(SHOPIFY_API_CONTEXT);

      expect(shopify).toBeDefined();
    });

    it('should provide session storage', () => {
      const sessionStorage = moduleRef.get<SessionStorage>(
        SHOPIFY_API_SESSION_STORAGE
      );

      expect(sessionStorage).toBeDefined();
    });
  });

  describe('#forRootAsync', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyCoreModule.forRootAsync({
            useFactory: () => mockedShopifyCoreOptions,
          }),
        ],
      }).compile();
    });

    it('should provide Shopify context', () => {
      const shopify = moduleRef.get<Shopify>(SHOPIFY_API_CONTEXT);

      expect(shopify).toBeDefined();
    });

    it('should provide session storage', () => {
      const sessionStorage = moduleRef.get<SessionStorage>(
        SHOPIFY_API_SESSION_STORAGE
      );

      expect(sessionStorage).toBeDefined();
    });
  });
});
