---
'@nestjs-shopify/webhooks': major
---

Allow multiple handlers for a single webhook event:

With the upgrade to v6 of `@shopify/shopify-api`, multiple handlers for a single Shopify webhook is allowed:

```ts
import {
  ShopifyWebhookHandler,
  WebhookHandler,
} from '@nestjs-shopify/webhooks';

@WebhookHandler('PRODUCTS_CREATE')
export class Handler1 extends ShopifyWebhookHandler {
  async handle(shop: string, data: unknown) {}
}

@WebhookHandler('PRODUCTS_CREATE')
export class Handler2 extends ShopifyWebhookHandler {
  async handle(shop: string, data: unknown) {}
}
```
