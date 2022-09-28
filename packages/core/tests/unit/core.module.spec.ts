import { Test, TestingModule } from '@nestjs/testing';
import { ApiVersion, Shopify } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import { MemorySessionStorage } from '@shopify/shopify-api/dist/session-storage/memory';
import { ShopifyCoreOptions } from '../../src/core.interfaces';
import { ShopifyCoreModule } from '../../src/core.module';
import { SHOPIFY_API_CONTEXT } from '../../src/core.constants';

const requiredOptions: ShopifyCoreOptions = {
  apiKey: 'foo',
  apiSecretKey: 'bar',
  apiVersion: ApiVersion.Unstable,
  hostName: 'localhost:8081',
  isEmbeddedApp: true,
  hostScheme: 'http',
  isPrivateApp: false,
  scopes: new AuthScopes('test_scope'),
  sessionStorage: new MemorySessionStorage(),
};

describe('ShopifyCoreModule', () => {
  let moduleRef: TestingModule;

  describe('#forRoot', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [ShopifyCoreModule.forRoot(requiredOptions)],
      }).compile();
    });

    it('should provide Shopify context', async () => {
      const shopify = moduleRef.get<Shopify>(SHOPIFY_API_CONTEXT);

      expect(shopify).toBeDefined();
    });
  });

  describe('#forRootAsync', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyCoreModule.forRootAsync({
            useFactory: () => requiredOptions,
          }),
        ],
      }).compile();
    });

    it('should provide Shopify context', async () => {
      const shopify = moduleRef.get<Shopify>(SHOPIFY_API_CONTEXT);

      expect(shopify).toBeDefined();
    });
  });
});
