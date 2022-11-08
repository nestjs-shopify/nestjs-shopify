import { ApiVersion } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/lib/auth/scopes';
import { ShopifyCoreModule } from '../../src/core.module';
import { mockLogger } from './mock-logger';
import { mockSessionStorage } from './mock-session-storage';

export const mockedShopifyCoreOptions = {
  apiKey: 'foo',
  apiSecretKey: 'bar',
  apiVersion: ApiVersion.Unstable,
  scopes: new AuthScopes(['test_scope']),
  hostName: 'localhost:3001',
  hostScheme: 'http' as const,
  isEmbeddedApp: true,
  isPrivateApp: false,
  sessionStorage: mockSessionStorage,
  logger: mockLogger,
};

export const MockShopifyCoreModule = ShopifyCoreModule.forRoot(
  mockedShopifyCoreOptions
);
