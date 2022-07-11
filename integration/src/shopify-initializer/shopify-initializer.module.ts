import { ShopifyCoreModule } from '@nestjs-shopify/core';
import { Module } from '@nestjs/common';
import { ApiVersion } from '@shopify/shopify-api';

@Module({
  imports: [
    ShopifyCoreModule.forRoot({
      apiKey: 'foo',
      apiSecret: 'bar',
      apiVersion: ApiVersion.Unstable,
      hostName: 'test.myshopify.io',
      isEmbeddedApp: true,
      scopes: ['write_products'],
    }),
  ],
  exports: [ShopifyCoreModule],
})
export class ShopifyInitializerModule {}
