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
npm install @nestjs-shopify/express @nestjs-shopify/core
```

> **Note**
>
> Install `@nestjs-shopify/express` if you are using Express, or `@nestjs-shopify/fastify` if you are using Fastify.

See `@nestjs-shopify/express` usage: https://github.com/nestjs-shopify/nestjs-shopify/tree/main/packages/express

## Usage

`@nestjs-shopify/auth` supports either **Token Exchange** or **Authorization Code Grant Flow**.
The choice of auth strategy is configured by setting the `authStrategy` argument to either `AuthStrategy.TokenExchange` or `AuthStrategy.AuthorizationCode`. If not set, this property defaults to `AuthStrategy.AuthorizationCode` due to backwards compatibility.

### Token Exchange

From any module, import the `ShopifyAuthModule` using `forRootOnline`, `forRootOffline`, `forRootAsyncOnline` or `forRootAsyncOffline` and set the `authStrategy` argument to `AuthStrategy.TokenExchange`:

```ts
// app.module.ts
import { AuthStrategy, ShopifyAuthModule } from '@nestjs-shopify/auth';

@Module({
  imports: [
    ShopifyAuthModule.forRootOnline(AuthStrategy.TokenExchange, {
      returnHeaders: true,
    }),
  ],
})
export class AppModule {}
```

Or using `useFactory`/`useClass`/`useExisting`:

```ts
// app.module.ts
import { AuthStrategy, ShopifyAuthModule } from '@nestjs-shopify/auth';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncOnline(AuthStrategy.TokenExchange, {
      useFactory: () => ({
        returnHeaders: true,
      }),
    }),
  ],
})
export class AppModule {}
```

You can provide an injectable that will be called after a token exchange for an offline or online auth was successful:

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
export class MyAuthHandler implements ShopifyTokenExchangeAuthAfterHandler {
  constructor(private readonly tokenExchangeService: ShopifyTokenExchangeService) {}
  async afterAuth({ session, sessionToken }: ShopifyTokenExchangeAuthAfterHandlerParams) {
    if (session.isOnline) {
      try {
        const offlineSession = await this.tokenExchangeService.exchangeToken(sessionToken, session.shop, AccessMode.Offline);
        // store session
      } catch (e) {
        /* empty */
      }
    }
  }
}
```

and provide and inject it to your `ShopifyAuthModule`:

```ts
// app.module.ts
import { AuthStrategy, ShopifyAuthModule } from '@nestjs-shopify/auth';
import { AuthHandlerModule } from './auth-handler/auth-handler.module';
import { MyAuthHandler } from './auth-handler/my-auth.handler';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncOnline(AuthStrategy.TokenExchange, {
      imports: [AuthHandlerModule],
      useFactory: (afterAuthHandler: MyAuthHandler) => ({
        returnHeaders: true,
        afterAuthHandler,
      }),
      inject: [MyAuthHandler],
    }),
  ],
})
export class AppModule {}
```

### Authorization Code Grant Flow

From any module, import the `ShopifyAuthModule` using `forRootOnline`, `forRootOffline`, `forRootAsyncOnline` or `forRootAsyncOffline` and set the `authStrategy` to `AUTHORIZATION_CODE_FLOW`:

```ts
// app.module.ts
import { AuthStrategy, ShopifyAuthModule } from '@nestjs-shopify/auth';

@Module({
  imports: [
    ShopifyAuthModule.forRootOnline(AuthStrategy.AuthorizationCode, {
      basePath: 'user',
    }),
  ],
})
export class AppModule {}
```

Or using `useFactory`/`useClass`/`useExisting`:

```ts
// app.module.ts
import { AuthStrategy, ShopifyAuthModule } from '@nestjs-shopify/auth';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncOnline(AuthStrategy.AuthorizationCode, {
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
  async afterAuth(req: Request, res: Response, session: Session) {
    // implement your logic after a successful auth.
    // you can check `session.isOnline` to see if it was an online auth or offline auth.
  }
}
```

and provide and inject it to your `ShopifyAuthModule`:

```ts
// app.module.ts
import { AuthStrategy, ShopifyAuthModule } from '@nestjs-shopify/auth';
import { AuthHandlerModule } from './auth-handler/auth-handler.module';
import { MyAuthHandler } from './auth-handler/my-auth.handler';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncOnline(AuthStrategy.AuthorizationCode, {
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
import { AuthStrategy, ShopifyAuthModule } from '@nestjs-shopify/auth';
import { AuthHandlerModule } from './auth-handler/auth-handler.module';
import { MyAuthHandler } from './auth-handler/my-auth.handler';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncOnline(AuthStrategy.AuthorizationCode, {
      imports: [AuthHandlerModule],
      useFactory: (afterAuthHandler: MyAuthHandler) => ({
        basePath: 'user',
        afterAuthHandler,
      }),
      inject: [MyAuthHandler],
    }),
    ShopifyAuthModule.forRootAsyncOffline(AuthStrategy.AuthorizationCode, {
      imports: [AuthHandlerModule],
      useFactory: (afterAuthHandler: MyAuthHandler) => ({
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
  show(@CurrentSession() session: Session, @Param('id') productId: string) {
    // do something
  }
}
```
