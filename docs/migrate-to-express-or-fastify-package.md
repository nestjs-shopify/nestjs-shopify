# Migrating to `@nestjs-shopify/express` or `@nestjs-shopify/fastify`

The `@nestjs-shopify/core` package has been deprecated in favor of `@nestjs-shopify/express` or `@nestjs-shopify/fastify`. The new packages are designed to work with the respective web frameworks and provide a more flexible and powerful API.

To migrate your NestJS app to use the new adaptable version, follow this guide.

## Table of Contents

- [Express](#express-package)
- [Fastify](#fastify-package)
- [Changes to CSP](#changes-to-csp)
- [Changes to HMAC validation](#changes-to-hmac-validation)

## Express package

Add the new `@nestjs-shopify/express` package to your project:

```bash
npm install @nestjs-shopify/express
```

or using Yarn:

```bash
yarn add @nestjs-shopify/express
```

You will have to replace all occurences to `ShopifyCoreModule` with `ShopifyExpressModule` in your application root module:

```patch
// app.module.ts
import { Module } from '@nestjs/common';
-import { ShopifyCoreModule } from '@nestjs-shopify/core';
+import { ShopifyExpressModule } from '@nestjs-shopify/express';

@Module({
  imports: [
-    ShopifyCoreModule.forRoot({
+    ShopifyExpressModule.forRoot({
      apiKey: 'foo',
      apiSecret
```

## Fastify package

Add the new `@nestjs-shopify/fastify` package to your project:

```bash
npm install @nestjs-shopify/fastify
```

or using Yarn:

```bash
yarn add @nestjs-shopify/fastify
```

You will have to replace all occurences to `ShopifyCoreModule` with `ShopifyFastifyModule` in your application root module:

```patch
// app.module.ts
import { Module } from '@nestjs/common';
-import { ShopifyCoreModule } from '@nestjs-shopify/core';
+import { ShopifyFastifyModule } from '@nestjs-shopify/fastify';

@Module({
  imports: [
-    ShopifyCoreModule.forRoot({
+    ShopifyFastifyModule.forRoot({
      apiKey: 'foo',
      apiSecret
```

## Changes to CSP

The `ShopifyCspMiddleware` has been moved to a separate package. If you were using it in your application, you will have to install the new package:

```bash
npm install @nestjs-shopify/common
```

or using Yarn:

```bash
yarn add @nestjs-shopify/common
```

You will have to replace all imports to `ShopifyCspMiddleware`:

```patch
// app.module.ts
import { Module } from '@nestjs/common';
-import { ShopifyCspMiddleware } from '@nestjs-shopify/core';
+import { ShopifyCspMiddleware } from '@nestjs-shopify/common';
```

## Changes to HMAC validation

The `ShopifyHmacGuard` has been moved to the `@nestjs-shopify/common` package as well. If you were using it in your application, you will have to install the new package:

```bash
npm install @nestjs-shopify/common
```

or using Yarn:

```bash
yarn add @nestjs-shopify/common
```

You will have to replace all imports to `ShopifyHmacGuard`:

```patch
// app.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
-import { ShopifyHmacGuard } from '@nestjs-shopify/core';
+import { ShopifyHmacGuard } from '@nestjs-shopify/common';

@Controller('products')
export class ProductController {
  @Get()
  @UseGuards(ShopifyHmacGuard)
  getProducts() {
    // ...
  }
}
```

Or if you were using the `@ShopifyHmac` decorator:

```patch
// product.controller.ts
import { Controller, Get } from '@nestjs/common';
-import { ShopifyHmac, ShopifyHmacType } from '@nestjs-shopify/core';
+import { ShopifyHmac, ShopifyHmacType } from '@nestjs-shopify/common';

@Controller('products')
export class ProductController {
  @Get()
  @ShopifyHmac(HmacType.Query)
  getProducts() {
    // ...
  }
}
```
