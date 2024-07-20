# @nestjs-shopify/webhooks

## 5.0.0

### Major Changes

- 958a0ce: support for token exchange auth

### Patch Changes

- Updated dependencies [958a0ce]
  - @nestjs-shopify/core@5.0.0
  - @nestjs-shopify/common@2.0.0

## 4.0.1

### Patch Changes

- 46810b8: chore(deps): update dependency @shopify/shopify-api to v10

## 4.0.0

### Major Changes

- 71d76a0: Rewrite core to allow Express and Fastify specific modules. See [upgrade guide](/docs/migrate-to-express-package.md)

### Patch Changes

- Updated dependencies [71d76a0]
  - @nestjs-shopify/common@1.0.0
  - @nestjs-shopify/core@4.0.0

## 3.2.0

### Minor Changes

- 2b99147: update dependencies @shopify/shopify-api to 9.0.1 and @shopify/shopify-app-session-storage to 2.0.3, also allow those versions in peerDependencies

## 3.1.1

### Patch Changes

- ea7e6d5: fix: stringify webhook registration error response

## 3.1.0

### Minor Changes

- e83d181: update dependencies @shopify/shopify-api to 8.0.1 and @shopify/shopify-app-session-storage to 2.0.0, also allow those versions in peerDependencies

## 3.0.1

### Patch Changes

- 1857bfc: Disallow @nestjs versions lower than `9.0.0`. Older versions will not work.

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
  } from "@nestjs-shopify/webhooks";

  @WebhookHandler("PRODUCTS_CREATE")
  export class Handler1 extends ShopifyWebhookHandler {
    async handle(shop: string, data: unknown) {}
  }

  @WebhookHandler("PRODUCTS_CREATE")
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
  @WebhookHandler("PRODUCTS_CREATE")
  export class Handler1 extends ShopifyWebhookHandler {
    async handle(shop: string, data: unknown) {}
  }
  ```

  after:

  ```ts
  @WebhookHandler("PRODUCTS_CREATE")
  export class Handler1 extends ShopifyWebhookHandler {
    async handle(shop: string, data: unknown, webhookId: string) {}
  }
  ```
