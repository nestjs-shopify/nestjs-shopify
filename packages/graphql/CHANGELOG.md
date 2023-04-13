# @nestjs-shopify/graphql

## 4.0.0

### Patch Changes

- Updated dependencies [83687c1]
  - @nestjs-shopify/auth@4.0.0
  - @nestjs-shopify/core@3.0.0

## 3.1.0

### Minor Changes

- c9a89c6: Add and use `@InjectShopify()` and `@InjectShopifySessionStorage()` decorators.

## 3.0.0

### Patch Changes

- Updated dependencies [bd636c5]
  - @nestjs-shopify/auth@3.0.0

## 2.0.2

### Patch Changes

- e4b42a0: Fix graphql return output. The GraphQL proxy contained a GZIP header that did not work. Also, the GraphQL Proxy function of `@shopify/shopify-api` returns parsed JSON. Make sure to stringify it before returning it from the `ShopifyGraphqlProxyController`.

## 2.0.1

### Patch Changes

- 0d0fd61: Fix graphql package having es6 output

## 2.0.0

### Patch Changes

- Updated dependencies [8782b25]
  - @nestjs-shopify/core@2.0.0
  - @nestjs-shopify/auth@2.0.0

## 1.0.0

### Major Changes

- e6a3891: Upgrade to v6.0.0 of `@shopify/shopify-api`.

  See the upgrade guide of [`@shopify/shopify-api`](https://github.com/Shopify/shopify-api-js/blob/main/docs/migrating-to-v6.md)

  Run `npm install @shopify/shopify-api@6.0.0` or `yarn add @shopify/shopify-api@6.0.0` together with the upgrade of all `@nestjs-shopify/*` packages.

### Patch Changes

- Updated dependencies [e6a3891]
- Updated dependencies [e6a3891]
  - @nestjs-shopify/auth@1.0.0
