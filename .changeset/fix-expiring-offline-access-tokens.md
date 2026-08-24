---
'@nestjs-shopify/core': patch
'@nestjs-shopify/auth': patch
---

Pass `expiring` flag to `auth.callback()` and `auth.tokenExchange()` to support expiring offline access tokens. Shopify mandated expiring offline tokens for public apps as of April 2026. Both Authorization Code and Token Exchange flows now accept a `useExpiringOfflineAccessTokens` option in their module configuration (defaults to `false` for backwards compatibility with private/custom apps).
