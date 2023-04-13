# @nestjs-shopify/core

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
  import { InjectShopify } from '@nestjs-shopify/core';
  import { Shopify } from '@shopify/shopify-api';

  @Injectable()
  export class MyProvider {
    constructor(@InjectShopify() private readonly shopifyApi: Shopify) {}
  }
  ```

  Or if you need references while registering a provider:

  ```ts
  import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
  import { Shopify } from '@shopify/shopify-api';

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
