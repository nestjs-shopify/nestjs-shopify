import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { ShopifyCoreModule } from '@nestjs-shopify/core';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { ApiVersion } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import { MemorySessionStorage } from '@shopify/shopify-api/dist/session-storage/memory';
import { ShopifyGraphqlProxyModule } from '../../src/graphql-proxy/graphql-proxy.module';

export function createTestingModule() {
  return Test.createTestingModule({
    imports: [
      ShopifyCoreModule.forRoot({
        apiKey: 'foo',
        apiSecretKey: 'bar',
        apiVersion: ApiVersion.Unstable,
        hostName: 'localhost:3000',
        hostScheme: 'http',
        isEmbeddedApp: true,
        isPrivateApp: false,
        scopes: new AuthScopes('test_scope'),
        sessionStorage: new MemorySessionStorage(),
      }),
      ShopifyAuthModule.forRootOnline({}),
      ShopifyGraphqlProxyModule,
    ],
  });
}

export async function createTestApp(appModule?: TestingModuleBuilder) {
  const module = appModule ?? createTestingModule();
  const testingModule = await module.compile();

  return testingModule.createNestApplication({ rawBody: true });
}
