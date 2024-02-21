import {
  ShopifyCoreAsyncOptions,
  ShopifyCoreModule,
  ShopifyCoreOptions,
  ShopifyHttpAdapter,
} from '@nestjs-shopify/core';
import { Global, Module } from '@nestjs/common';
import { ShopifyFastifyAdapter } from './http/fastify.http-adapter';

@Module({
  providers: [
    {
      provide: ShopifyHttpAdapter,
      useClass: ShopifyFastifyAdapter,
    },
  ],
  exports: [ShopifyHttpAdapter, ShopifyCoreModule],
})
@Global()
export class ShopifyFastifyModule {
  static forRoot(options: ShopifyCoreOptions) {
    return {
      module: ShopifyFastifyModule,
      imports: [ShopifyCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: ShopifyCoreAsyncOptions) {
    return {
      module: ShopifyFastifyModule,
      imports: [ShopifyCoreModule.forRootAsync(options)],
    };
  }
}
