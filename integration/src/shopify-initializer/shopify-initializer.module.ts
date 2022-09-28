import { ShopifyCoreModule } from '@nestjs-shopify/core';
import { Module } from '@nestjs/common';
import { ApiVersion } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import { MemorySessionStorage } from '@shopify/shopify-api/dist/session-storage/memory';

@Module({
  imports: [
    ShopifyCoreModule.forRoot({
      apiKey: 'foo',
      apiSecretKey: 'bar',
      apiVersion: ApiVersion.Unstable,
      hostName: 'localhost:8082',
      hostScheme: 'https',
      isEmbeddedApp: true,
      isPrivateApp: false,
      scopes: new AuthScopes(['write_products']),
      sessionStorage: new MemorySessionStorage(),
    }),
  ],
  exports: [ShopifyCoreModule],
})
export class ShopifyInitializerModule {}
