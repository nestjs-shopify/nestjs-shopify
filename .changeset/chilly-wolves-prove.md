---
'@nestjs-shopify/auth': major
---

Removed `ShopifyAuthGuard.register()`. Before you had to import the `ShopifyAuthGuard` as followingbe to be able to use `@UseShopifyAuth()`:

```ts
@Module({
  imports: [ShopifyAuthGuard.register()],
  controllers: [MyControllerUsingShopifyAuth],
})
class MyModule {}
```

This call is now not required anymore. All you have to do is ensure is that `ShopifyAuthGuard.forRootOnline` or `ShopifyAuthGuard.forRootOffline` is imported your root module (usually called `AppModule`).

That means that you should remove any references to to `ShopifyAuthGuard.register()`:

```diff
@Module({
- imports: [ShopifyAuthGuard.register()],
  controllers: [MyControllerUsingShopifyAuth],
})
class MyModule {}
```
