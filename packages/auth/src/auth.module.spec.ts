import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SHOPIFY_AUTH_OPTIONS } from './auth.constants';
import {
  AccessMode,
  ShopifyAuthModuleOptions,
  ShopifyAuthOptionsFactory,
} from './auth.interfaces';
import { ShopifyAuthModule } from './auth.module';

@Injectable()
class AsyncConfig implements ShopifyAuthOptionsFactory {
  createShopifyAuthOptions(): ShopifyAuthModuleOptions {
    return {
      basePath: 'test',
      useGlobalPrefix: true,
    };
  }
}

describe('ShopifyAuthModule', () => {
  let module: TestingModule;

  describe.each([AccessMode.Online, AccessMode.Offline])(
    'with %s access mode',
    (accessMode: AccessMode) => {
      describe('.forRoot', () => {
        beforeEach(async () => {
          module = await Test.createTestingModule({
            imports: [
              ShopifyAuthModule.forRoot(accessMode, {
                basePath: 'testing',
              }),
            ],
          }).compile();
        });

        it('should provide options', async () => {
          const options = await module.resolve<ShopifyAuthModuleOptions>(
            SHOPIFY_AUTH_OPTIONS
          );

          expect(options).toEqual({
            basePath: 'testing',
          });
        });
      });

      describe('.forRootAsync', () => {
        it('should accept useFactory', async () => {
          const module = await Test.createTestingModule({
            imports: [
              ShopifyAuthModule.forRootAsync(accessMode, {
                useFactory: () => ({
                  basePath: 'test',
                }),
              }),
            ],
          }).compile();

          const options = await module.resolve<ShopifyAuthModuleOptions>(
            SHOPIFY_AUTH_OPTIONS
          );

          expect(options).toEqual({
            basePath: 'test',
          });
        });

        it('should accept useClass', async () => {
          const module = await Test.createTestingModule({
            imports: [
              ShopifyAuthModule.forRootAsync(accessMode, {
                useClass: AsyncConfig,
              }),
            ],
          }).compile();

          const options = await module.resolve<ShopifyAuthModuleOptions>(
            SHOPIFY_AUTH_OPTIONS
          );

          expect(options).toEqual({
            basePath: 'test',
            useGlobalPrefix: true,
          });
        });

        it('should accept useExisting', async () => {
          const module = await Test.createTestingModule({
            imports: [
              ShopifyAuthModule.forRootAsync(accessMode, {
                imports: [
                  {
                    module: class AsyncConfigModule {},
                    providers: [AsyncConfig],
                    exports: [AsyncConfig],
                  },
                ],
                useExisting: AsyncConfig,
              }),
            ],
          }).compile();

          const options = await module.resolve<ShopifyAuthModuleOptions>(
            SHOPIFY_AUTH_OPTIONS
          );

          expect(options).toEqual({
            basePath: 'test',
            useGlobalPrefix: true,
          });
        });
      });
    }
  );
});
