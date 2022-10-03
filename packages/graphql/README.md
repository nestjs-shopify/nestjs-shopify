# @nestjs-shopify/graphql

A NestJS module for exposing a Shopify GraphQL Admin API proxy. The `ShopifyGraphqlProxyModule` allows you to expose the GraphQL Admin API without having to pass in an `X-Shopify-Access-Token`. The module automatically provides everything necessary to call the Shopify GraphQL Admin API. Uses [`@shopify/shopify-api`](https://github.com/shopify/shopify-node-api) under the hood.

# Installation

Install required dependencies and this package using NPM:

```
npm i @shopify/shopify-api @nestjs-shopify/core @nestjs-shopify/auth @nestjs-shopify/graphql
```

or using Yarn:

```
yarn add @shopify/shopify-api @nestjs-shopify/core @nestjs-shopify/auth @nestjs-shopify/graphql
```

# Usage

From your application root module, import the `ShopifyGraphqlProxyModule`:

```ts
// app.module.ts
import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { ShopifyCoreModule } from '@nestjs-shopify/core';
import { ShopifyGraphqlProxyModule } from '@nestjs-shopify/graphql';

@Module({
  imports: [
    ShopifyCoreModule.forRoot({
      apiKey: 'foo',
      apiSecret: 'bar',
      apiVersion: ApiVersion.Unstable,
      hostName: 'localhost:8081',
      isEmbeddedApp: true,
      scopes: ['test_scope'],
    }),
    ShopifyAuthModule.forRootOnline({
      basePath: 'user',
      returnHeaders: true,
    }),
    ShopifyGraphqlProxyModule,
  ],
})
export class AppModule {}
```

This will expose the `/graphql` endpoint.

Make sure to setup online session authentication using `ShopifyAuthModule` with `forRootOnline` or `forRootAsyncOnline`. The Admin GraphQL API proxy only works with online session tokens. Not with offline tokens.
