# @nestjs-shopify/common

[@shopify/shopify-node-api](https://github.com/Shopify/shopify-node-api) to setup your Shopify context in a NestJS application.
This library was generated with [Nx](https://nx.dev).

# Installation

```
npm i @shopify/shopify-api @nestjs-shopify/core @nestjs-shopify/express @nestjs-shopify/common
```

or using Yarn:

```
yarn add @shopify/shopify-api @nestjs-shopify/core @nestjs-shopify/express @nestjs-shopify/common
```

# Usage

Run `nx test common` to execute the unit tests via [Jest](https://jestjs.io).

# CSP middleware

The library provides a CSP middleware that you can use to protect your application from XSS attacks. The middleware is not applied by default. To make use of this middleware, add the following to your application root module:

```ts
// app.module.ts
import { ShopifyCspMiddleware } from '@nestjs-shopify/common';
import { ShopifyExpressModule } from '@nestjs-shopify/express';
import { Module, NestModule } from '@nestjs/common';

@Module({
  imports: [
    ShopifyExpressModule.forRoot({ ... }),
    // ...
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the middleware to all routes
    consumer.apply(ShopifyCspMiddleware).forRoutes('*');

    // Or apply the middleware to specific routes
    consumer
      .apply(ShopifyCspMiddleware)
      .exclude('cats')
      .forRoutes({ path: 'ab*cd', method: RequestMethod.ALL });
  }
}
```
