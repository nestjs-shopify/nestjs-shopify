---
'@nestjs-shopify/core': major
---

Breaking changes to `Shopify` singleton:

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
