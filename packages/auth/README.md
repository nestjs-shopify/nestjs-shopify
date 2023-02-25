# @nestjs-shopify/auth

An OAuth setup for NestJS using Shopify's [@shopify/shopify-node-api](https://github.com/Shopify/shopify-node-api) package. Allows for online and offline auth using this module.

## Installation

Install package using NPM:

```
npm install @nestjs-shopify/auth
```

or using Yarn:

```
yarn add @nestjs-shopify/auth
```

Make sure you have your Shopify context initialized:

```
npm install @nestjs-shopify/core
```

See `@nestjs-shopify/core` usage: https://github.com/nestjs-shopify/nestjs-shopify/tree/main/packages/core.

## Usage

From any module, import the `ShopifyAuthModule` using `forRootOnline`, `forRootOffline`, `forRootAsyncOnline` or `forRootAsyncOffline`:

```ts
// app.module.ts
import { ShopifyAuthModule } from '@nestjs-shopify/auth';

@Module({
  imports: [
    ShopifyAuthModule.forRootOnline({
      basePath: 'user',
    }),
  ],
})
export class AppModule {}
```

Or using `useFactory`/`useClass`/`useExisting`:

```ts
// app.module.ts
import { ShopifyAuthModule } from '@nestjs-shopify/auth';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncOnline({
      useFactory: () => ({
        basePath: 'user',
      }),
    }),
  ],
})
export class AppModule {}
```

You can provide an injectable that can handle the redirection or any other setup you want after an offline or online auth was successful:

```ts
// auth-handler/auth-handler.module.ts
import { MyAuthHandler } from './my-auth.handler';

@Module({
  providers: [MyAuthHandler],
  exports: [MyAuthHandler],
})
export class AuthHandlerModule {}
```

```ts
// auth-handler/my-auth.handler.ts
@Injectable()
export class MyAuthHandler implements ShopifyAuthAfterHandler {
  async afterAuth(req: Request, res: Response, session: SessionInterface) {
    // implement your logic after a successful auth.
    // you can check `session.isOnline` to see if it was an online auth or offline auth.
  }
}
```

and provide and inject it to your `ShopifyAuthModule`:

```ts
// app.module.ts
import { AuthHandlerModule } from './auth-handler/auth-handler.module';
import { MyAuthHandler } from './auth-handler/my-auth.handler';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncOnline({
      imports: [AuthHandlerModule],
      useFactory: (afterAuthHandler: MyAuthHandler) => ({
        basePath: 'user',
        afterAuthHandler,
      }),
      inject: [MyAuthHandler],
    }),
  ],
})
export class AppModule {}
```

You can also use `useClass` and `useExisting` to register the `ShopifyAuthModule`.

You can also register both auth modes using the same Module:

```ts
// app.module.ts
import { AuthHandlerModule } from './auth-handler/auth-handler.module';
import { MyAuthHandler } from './auth-handler/my-auth.handler';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncOnline({
      imports: [AuthHandlerModule],
      useFactory: (afterAuthHandler: MyShopifyAuthHandler) => ({
        basePath: 'user',
        afterAuthHandler,
      }),
      inject: [MyAuthHandler],
    }),
    ShopifyAuthModule.forRootAsyncOffline({
      imports: [AuthHandlerModule],
      useFactory: (afterAuthHandler: MyShopifyAuthHandler) => ({
        basePath: 'shop',
        afterAuthHandler,
      }),
      inject: [MyAuthHandler],
    }),
  ],
})
export class AppModule {}
```

Now, with this `AppModule` configured, if you want to install an App and store the offline access token in your DB, or Redis, or whatever storage you prefer, just visit `/shop/auth?shop=<yourshopname>.myshopify.com`. And if you want to create short-lived online access token, for instance, to only perform one-off requests to Shopify Admin GraphQL, you can visit `/user/auth?shop=<yourshopname>.myshopify.com`.

### Authorization

When `ShopifyAuthModule` is setup, you can use `@UseShopifyAuth()` to require online or offline session in Controllers or specific routes. Example:
```ts
import { AccessMode, CurrentSession, UseShopifyAuth } from '@nestjs-shopify/auth';
import { Controller, Get } from '@nestjs/common';
import { Session } from '@shopify/shopify-api';

@UseShopifyAuth(AccessMode.Online)
@Controller()
export class ProductsController {
  @Get('products')
  index(@CurrentSession() session: Session) {
    // do something
  }

  @Get('products/:id')
  // Overriding the controller access mode:
  @UseShopifyAuth(AccessMode.Offline)
  show(
    @CurrentSession() session: Session,
    @Param('id') productId: string
  ) {
    // do something
  }
}
```
