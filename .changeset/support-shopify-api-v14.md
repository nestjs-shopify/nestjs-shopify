---
"@nestjs-shopify/auth": patch
"@nestjs-shopify/core": patch
"@nestjs-shopify/graphql": patch
"@nestjs-shopify/webhooks": patch
---

Add support for `@shopify/shopify-api` v14 and `@shopify/shopify-app-session-storage` v6. No code changes required; the v14 breaking changes (`subTopic` removal, GraphQL client type tightening, `@shopify/network` removal, App Proxy validation hardening) do not affect any API surface used by this library.
