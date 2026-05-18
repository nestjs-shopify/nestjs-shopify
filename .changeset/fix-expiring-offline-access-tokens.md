---
'@nestjs-shopify/core': patch
---

Pass `expiring: true` to `auth.callback()` to request expiring offline access tokens. Shopify mandated expiring offline tokens for public apps as of April 2026. Without this, Shopify issues a restricted token that returns 403 on all Admin API calls immediately after install.
