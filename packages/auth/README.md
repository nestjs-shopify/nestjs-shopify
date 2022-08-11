# @nestjs-shopify/auth

An OAuth setup for NestJS using Shopify's [@shopify/shopify-node-api](https://github.com/Shopify/shopify-node-api) package. Allows for online and offline auth using this module. Also adds a GraphQL proxy so you can use online tokens to proxy your GraphQL requests to Shopify, without exposing your Shopify Admin access token to the frontend.

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

From any module, import the `ShopifyAuthOnlineModule`/`ShopifyAuthOfflineModule` using `register` or `registerAsync`:

```ts
// app.module.ts
import { ShopifyAuthOnlineModule } from '@nestjs-shopify/auth';

@Module({
  imports: [
    ShopifyAuthOnlineModule.register({
      basePath: 'user',
    }),
  ],
})
export class AppModule {}
```

Or using `useFactory`/`useClass`/`useExisting`:

```ts
// app.module.ts
import { ShopifyAuthOnlineModule } from '@nestjs-shopify/auth';

@Module({
  imports: [
    ShopifyAuthOnlineModule.registerAsync({
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

and provide and inject it to your `ShopifyAuthOnlineModule`/`ShopifyAuthOfflineModule`:

```ts
// app.module.ts
import { AuthHandlerModule } from './auth-handler/auth-handler.module';
import { MyAuthHandler } from './auth-handler/my-auth.handler';

@Module({
  imports: [
    ShopifyAuthOnlineModule.registerAsync({
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

You can also use `useClass` and `useExisting` to register the `ShopifyAuthOnlineModule`/`ShopifyAuthOfflineModule`.

You can also register both auth modes using the same Module:

```ts
// app.module.ts
import { AuthHandlerModule } from './auth-handler/auth-handler.module';
import { MyAuthHandler } from './auth-handler/my-auth.handler';

@Module({
  imports: [
    ShopifyAuthOnlineModule.registerAsync({
      imports: [AuthHandlerModule],
      useFactory: (afterAuthHandler: MyShopifyAuthHandler) => ({
        basePath: 'user',
        afterAuthHandler,
      }),
      inject: [MyAuthHandler],
    }),
    ShopifyAuthOfflineModule.registerAsync({
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

When `ShopifyAuthOnlineModule`/`ShopifyAuthOfflineModule` is setup, you can use `@ShopifyOnlineAuth()` or `@ShopifyOfflineAuth` to require online or offline session in Controllers or specific routes. Example:

```ts
import { ShopifyOnlineAuth, ShopifyOfflineAuth } from '@nestjs-shopify/auth';
import { Controller, Get } from '@nestjs/common';

@ShopifyOnlineAuth()
@Controller()
export class AppController {
  @Get('online-route')
  hello() {
    return 'you are using online auth!';
  }

  @Get('offline-route')
  // Overriding the controller access mode:
  @ShopifyOfflineAuth()
  offline() {
    return 'you are using offline auth!';
  }
}
```

## GraphQL proxy

This module automatically attaches a GraphQL endpoint to `/graphql` if you register online auth. You will need valid online auth tokens to make use of it.
