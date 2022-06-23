import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import Shopify, { ApiVersion, ContextParams } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import { UninitializedContextError } from '@shopify/shopify-api/dist/error';
import {
  MemorySessionStorage,
  SessionStorage,
} from '@shopify/shopify-api/dist/auth/session';
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

@Injectable()
class MyCustomSessionStorage extends MemorySessionStorage {}

@Module({
  providers: [MyCustomSessionStorage],
  exports: [MyCustomSessionStorage],
})
class MyCustomSessionStorageModule {}

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
    });

    it('should initialize Shopify.Context', async () => {
      await moduleRef.init();

      expect(() => Shopify.Context.throwIfUninitialized()).not.toThrowError(
        UninitializedContextError
      );
    });

    it('should set the parameters to Shopify.Context', async () => {
      await moduleRef.init();

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

  describe('#forRootAsync', () => {
    it('allows :useFactory option', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyCoreModule.forRootAsync({
            useFactory: () => {
              return {
                ...requiredOptions,
              };
            },
          }),
        ],
      }).compile();

      await moduleRef.init();

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

    it('allows to inject custom session storage', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ShopifyCoreModule.forRootAsync({
            imports: [MyCustomSessionStorageModule],
            useFactory: async (sessionStorage: SessionStorage) => {
              return {
                ...requiredOptions,
                sessionStorage,
              };
            },
            inject: [MyCustomSessionStorage],
          }),
        ],
      }).compile();

      await moduleRef.init();

      expect(Shopify.Context.SESSION_STORAGE).toBeInstanceOf(
        MyCustomSessionStorage
      );
    });
  });
});
