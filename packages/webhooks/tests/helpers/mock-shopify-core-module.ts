import { ApiVersion } from '@shopify/shopify-api';
import { mockLogger } from './mock-logger';
import { mockSessionStorage } from './mock-session-storage';
import { ShopifyExpressModule } from '@nestjs-shopify/express';

export const mockedShopifyCoreOptions = {
  apiKey: 'foo',
  apiSecretKey: 'bar',
  apiVersion: ApiVersion.Unstable,
  scopes: ['test_scope'],
  hostName: 'localhost:3001',
  hostScheme: 'http' as const,
  isEmbeddedApp: true,
  isPrivateApp: false,
  sessionStorage: mockSessionStorage,
  logger: mockLogger,
};

export const MockShopifyCoreModule = ShopifyExpressModule.forRoot(
  mockedShopifyCoreOptions,
);
