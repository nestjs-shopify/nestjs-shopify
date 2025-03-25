# @nestjs-shopify/graphql

## 6.0.1

### Patch Changes

- 3789771: chore: bump peer dependencies for NestJS 11 support

## 6.0.0

### Major Changes

- 958a0ce: support for token exchange auth

### Patch Changes

- Updated dependencies [958a0ce]
  - @nestjs-shopify/auth@6.0.0
  - @nestjs-shopify/core@5.0.0

## 5.0.1

### Patch Changes

- 46810b8: chore(deps): update dependency @shopify/shopify-api to v10

## 5.0.0

### Major Changes

- 71d76a0: Rewrite core to allow Express and Fastify specific modules. See [upgrade guide](/docs/migrate-to-express-package.md)

### Patch Changes

- Updated dependencies [71d76a0]
  - @nestjs-shopify/auth@5.0.0
  - @nestjs-shopify/core@4.0.0

## 4.2.0

### Minor Changes

- 2b99147: update dependencies @shopify/shopify-api to 9.0.1 and @shopify/shopify-app-session-storage to 2.0.3, also allow those versions in peerDependencies

## 4.1.0

### Minor Changes

- e83d181: update dependencies @shopify/shopify-api to 8.0.1 and @shopify/shopify-app-session-storage to 2.0.0, also allow those versions in peerDependencies

## 4.0.1

### Patch Changes

- 1857bfc: Disallow @nestjs versions lower than `9.0.0`. Older versions will not work.

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
