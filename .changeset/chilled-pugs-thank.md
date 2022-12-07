---
'@nestjs-shopify/auth': major
---

GraphQL proxy moved to own package.

Install `@nestjs-shopify/graphql` and use it as following:

```ts
import { ShopifyCoreModule } from '@nestjs-shopify/core';
import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { ShopifyGraphqlProxyModule } from '@nestjs-shopify/graphql';

@Module({
  imports: [
    // ...
    ShopifyCoreModule.forRoot(/* ... */),
    ShopifyAuthModule.forRootOnline(/* ... */),
    ShopifyGraphqlProxyModule,
    // ...
  ],
})
export class AppModule {}
```
