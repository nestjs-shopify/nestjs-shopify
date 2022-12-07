# @nestjs-shopify/core

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
  import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
  import { Shopify } from '@shopify/shopify-api';

  @Injectable()
  export class MyProvider {
    constructor(
      @Inject(SHOPIFY_API_CONTEXT) private readonly shopifyApi: Shopify
    ) {}
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
