import { Test, TestingModule } from '@nestjs/testing';
import Shopify, { ApiVersion, ContextParams } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import { UninitializedContextError } from '@shopify/shopify-api/dist/error';
import { ShopifyCoreOptions } from './core.interfaces';
import { ShopifyCoreModule } from './core.module';

const requiredOptions: ShopifyCoreOptions = {
  apiKey: 'foo',
  apiSecret: 'bar',
  apiVersion: ApiVersion.Unstable,
  hostName: 'localhost:8081',
  isEmbeddedApp: true,
  scopes: ['test_scope'],
};

describe('ShopifyCoreModule', () => {
  let moduleRef: TestingModule;

  describe('#forRoot', () => {
    beforeEach(async () => {
      moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyCoreModule.forRoot({
            ...requiredOptions,
          }),
        ],
      }).compile();

      await moduleRef.init();
    });

    it('should initialize Shopify.Context', async () => {
      expect(() => Shopify.Context.throwIfUninitialized()).not.toThrowError(
        UninitializedContextError
      );
    });

    it('should set the parameters to Shopify.Context', async () => {
      expect(Shopify.Context).toEqual(
        expect.objectContaining<ContextParams>({
          API_KEY: 'foo',
          API_SECRET_KEY: 'bar',
          API_VERSION: ApiVersion.Unstable,
          HOST_NAME: 'localhost:8081',
          IS_EMBEDDED_APP: true,
          SCOPES: new AuthScopes(['test_scope']),
        })
      );
    });
  });
});
