---
'@nestjs-shopify/auth': minor
'@nestjs-shopify/core': minor
---

Add support for expiring offline access tokens via the new `useExpiringOfflineAccessTokens` option.

Public apps must migrate to expiring offline access tokens by January 2027 (see [Shopify's migration guide](https://shopify.dev/docs/apps/build/authentication-authorization/migrate-to-expiring-offline-access-tokens)). When enabled, offline access tokens are requested with `expiring=1` in both the authorization code callback and token exchange flows.

Note: this option requires `@shopify/shopify-api` >= 13.1.0. On older versions the flag is silently ignored.
