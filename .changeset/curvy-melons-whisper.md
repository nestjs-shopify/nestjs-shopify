---
'@nestjs-shopify/graphql': patch
---

Fix graphql return output. The GraphQL proxy contained a GZIP header that did not work. Also, the GraphQL Proxy function of `@shopify/shopify-api` returns parsed JSON. Make sure to stringify it before returning it from the `ShopifyGraphqlProxyController`.
