# @nestjs-shopify/webhooks

## 3.0.0

### Patch Changes

- Updated dependencies [83687c1]
  - @nestjs-shopify/core@3.0.0

## 2.1.0

### Minor Changes

- c9a89c6: Add and use `@InjectShopify()` and `@InjectShopifySessionStorage()` decorators.

## 2.0.0

### Patch Changes

- Updated dependencies [8782b25]
  - @nestjs-shopify/core@2.0.0
  - @nestjs-shopify/auth@2.0.0

## 1.0.0

### Major Changes

- e6a3891: Allow multiple handlers for a single webhook event:

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

- e6a3891: Upgrade to v6.0.0 of `@shopify/shopify-api`.

  See the upgrade guide of [`@shopify/shopify-api`](https://github.com/Shopify/shopify-api-js/blob/main/docs/migrating-to-v6.md)

  Run `npm install @shopify/shopify-api@6.0.0` or `yarn add @shopify/shopify-api@6.0.0` together with the upgrade of all `@nestjs-shopify/*` packages.

### Minor Changes

- e6a3891: Webhook ID passed into Webhook Handlers.

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
