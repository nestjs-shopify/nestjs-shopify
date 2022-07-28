# @nestjs-shopify/webhooks

Enable Shopify webhook support for your NestJS application using `ShopifyWebhooskModule`. Import this module at the root level after `ShopifyCoreModule`:

```ts
// app.module.ts
import { MyHandler } from './my.handler.ts';

@Module({
  imports: [
    ShopifyCoreModule.forRoot({
      apiKey: 'foo',
      apiSecret: 'bar',
      apiVersion: ApiVersion.Unstable,
      hostName: 'localhost:8081',
      isEmbeddedApp: true,
      scopes: ['test_scope'],
    }),
    ShopifyWebhooksModule.forRoot({
      path: '/shopify-webhooks',
      topics: ['PRODUCTS_CREATE', 'CUSTOMERS_UPDATE'],
      handler: new MyHandler(),
    }),
  ],
  providers: [MyHandler],
})
export class AppModule {}
```

This module requires a handler that will be invoked with a `.process()` function for _every_ incoming webhook:

```ts
// my.handler.ts
import { ShopifyWebhookHandler } from 'shopify-nestjs-api';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyHandler implements ShopifyWebhookHandler {
  async process(topic: string, shop: string, body: string): Promise<void> {
    switch (topic) {
      case 'PRODUCTS_CREATE':
        // handle product creation logic
        break;
      case 'CUSTOMERS_UPDATE':
        // handle customer update logic
        break;
    }
  }
}
```

**NOTE: this package relies on Nest >8.4.5 `rawBody` option.**

```ts
// main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });
  await app.listen(3000);
}
bootstrap();
```

This will config gives us access to the raw body of a request to perform HMAC validation on incoming Shopify webhook requests.

You can also import the `ShopifyWebhooksModule` with `useFactory`, `useClass` or `useExisting` when importing the module using `.forRootAsync()`. This allows you to inject a webhook handler within the context of dependency injection in your application:

```ts
// app.module.ts
import { MyHandler } from './my.handler.ts';

@Module({
  imports: [
    ShopifyCoreModule.forRoot({
      apiKey: 'foo',
      apiSecret: 'bar',
      apiVersion: ApiVersion.Unstable,
      hostName: 'localhost:8081',
      isEmbeddedApp: true,
      scopes: ['test_scope'],
    }),
    ShopifyWebhooksModule.forRootAsync({
      useFactory: (handler: MyHandler) => ({
        path: '/shopify-webhooks',
        topics: ['PRODUCTS_CREATE', 'CUSTOMERS_UPDATE'],
        handler,
      }),
      inject: [MyHandler],
    }),
  ],
  providers: [MyHandler],
})
export class AppModule {}
```
