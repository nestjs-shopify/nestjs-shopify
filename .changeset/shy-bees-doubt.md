---
'@nestjs-shopify/webhooks': minor
---

Webhook ID passed into Webhook Handlers.

With the upgrade to `@shopify/shopify-api` v6 we now have (optional) access to the Webhook ID in our handlers:

before:

```ts
@WebhookHandler('PRODUCTS_CREATE')
export class Handler1 extends ShopifyWebhookHandler {
  async handle(shop: string, data: unknown) {}
}
```

after:

```ts
@WebhookHandler('PRODUCTS_CREATE')
export class Handler1 extends ShopifyWebhookHandler {
  async handle(shop: string, data: unknown, webhookId: string) {}
}
```
