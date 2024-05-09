# @nestjs-shopify/core

## 4.0.1

### Patch Changes

- 46810b8: chore(deps): update dependency @shopify/shopify-api to v10

## 4.0.0

### Major Changes

- 71d76a0: Rewrite core to allow Express and Fastify specific modules. See [upgrade guide](/docs/migrate-to-express-package.md)

## 3.3.0

### Minor Changes

- 2b99147: update dependencies @shopify/shopify-api to 9.0.1 and @shopify/shopify-app-session-storage to 2.0.3, also allow those versions in peerDependencies

## 3.2.0

### Minor Changes

- e83d181: update dependencies @shopify/shopify-api to 8.0.1 and @shopify/shopify-app-session-storage to 2.0.0, also allow those versions in peerDependencies

## 3.1.1

### Patch Changes

- 1857bfc: Disallow @nestjs versions lower than `9.0.0`. Older versions will not work.

## 3.1.0

### Minor Changes

- a82f3f8: Add `ShopifyCspMiddleware` to assign CSP frame-ancestors. See [NestJS Docs](https://docs.nestjs.com/middleware#applying-middleware) on how to use this middleware in your app.

## 3.0.0

### Major Changes

- 83687c1: Upgrade to `"@shopify/shopify-api": "^7.0.0"`. See changelog of `@shopify/shopify-api` for the required changes: https://github.com/Shopify/shopify-api-js/blob/main/CHANGELOG.md

## 2.1.0

### Minor Changes

- c9a89c6: Add and use `@InjectShopify()` and `@InjectShopifySessionStorage()` decorators.

## 2.0.0

### Major Changes

- 8782b25: Use new `@shopify/shopify-app-session-storage` package as the session storage engine.

  See https://github.com/Shopify/shopify-app-js/tree/main/packages for a list of session storage engines,
  or provide your own by extending the provided `SessionStorage` interface in `@nestjs-shopify/core`.

  Run `npm install @shopify/shopify-app-session-storage` because it's a required peer dependency.

## 1.0.0

### Major Changes

- e6a3891: Upgrade to v6.0.0 of `@shopify/shopify-api`.

  See the upgrade guide of [`@shopify/shopify-api`](https://github.com/Shopify/shopify-api-js/blob/main/docs/migrating-to-v6.md)

  Run `npm install @shopify/shopify-api@6.0.0` or `yarn add @shopify/shopify-api@6.0.0` together with the upgrade of all `@nestjs-shopify/*` packages.

- e6a3891: Breaking changes to `Shopify` singleton:

  With the upgrade to v6 of `@shopify/shopify-api`, there is no `Shopify` singleton anymore. So any of the following will not work:

  ```ts
  Shopify.Utils;
  Shopify.Context;
  Shopify.Auth;
  // etc...
  ```

  The Shopify API context now lives inside the Nest DI container. You can access it by doing the following in your injectable providers:

  ```ts
  import { InjectShopify } from "@nestjs-shopify/core";
  import { Shopify } from "@shopify/shopify-api";

  @Injectable()
  export class MyProvider {
    constructor(@InjectShopify() private readonly shopifyApi: Shopify) {}
  }
  ```

  Or if you need references while registering a provider:

  ```ts
  import { SHOPIFY_API_CONTEXT } from "@nestjs-shopify/core";
  import { Shopify } from "@shopify/shopify-api";

  @Module({
    providers: [
      {
        useFactory: (shopifyApi: Shopify) => ({
          // ...
        }),
        inject: [SHOPIFY_API_CONTEXT],
      },
    ],
  })
  export class MyModule {}
  ```
