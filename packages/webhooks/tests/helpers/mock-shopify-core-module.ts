import { ShopifyCoreModule } from '@nestjs-shopify/core';
import { ApiVersion } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import { MemorySessionStorage } from '@shopify/shopify-api/dist/session-storage/memory';

export const MockShopifyCoreModule = ShopifyCoreModule.forRoot({
  apiKey: 'foo',
  apiSecretKey: 'bar',
  apiVersion: ApiVersion.Unstable,
  scopes: new AuthScopes(['test_scope']),
  hostName: 'localhost:3001',
  hostScheme: 'http',
  isEmbeddedApp: true,
  isPrivateApp: false,
  sessionStorage: new MemorySessionStorage(),
});
