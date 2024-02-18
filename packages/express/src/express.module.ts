import {
  ShopifyCoreAsyncOptions,
  ShopifyCoreModule,
  ShopifyCoreOptions,
  ShopifyHttpAdapter,
} from '@nestjs-shopify/core';
import { Global, Module } from '@nestjs/common';
import { ShopifyExpressAdapter } from './http/express.http-adapter';

@Module({
  providers: [
    {
      provide: ShopifyHttpAdapter,
      useClass: ShopifyExpressAdapter,
    },
  ],
  exports: [ShopifyHttpAdapter, ShopifyCoreModule],
})
@Global()
export class ShopifyExpressModule {
  static forRoot(options: ShopifyCoreOptions) {
    return {
      module: ShopifyExpressModule,
      imports: [ShopifyCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: ShopifyCoreAsyncOptions) {
    return {
      module: ShopifyExpressModule,
      imports: [ShopifyCoreModule.forRootAsync(options)],
    };
  }
}
