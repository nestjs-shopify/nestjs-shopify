# @nestjs-shopify/webhooks

Enable Shopify webhook support for your NestJS application using `ShopifyWebhooksModule`. Import this module at the root level after `ShopifyCoreModule`:

```ts
// app.module.ts
import { CustomersCreateWebhookHandler } from './customers-create.webhook-handler.ts';

@Module({
  imports: [
    ShopifyCoreModule.forRoot({
      apiKey: 'foo',
      apiSecretKey: 'bar',
      apiVersion: ApiVersion.Unstable,
      hostName: 'localhost:8081',
      isEmbeddedApp: true,
      scopes: ['test_scope'],
    }),
    ShopifyWebhooksModule.forRoot({
      path: '/shopify-webhooks',
    }),
  ],
  providers: [CustomersCreateWebhookHandler],
})
export class AppModule {}
```

The `ShopifyWebhooksModule` automatically configures webhook handlers based on the usage of the `@WebhookHandler` class decorator. These webhook handlers require you to extend the `ShopifyWebhookHandler` class and define a `handle` method:

```ts
// customers-create.webhook-handler.ts
import {
  ShopifyWebhookHandler,
  WebhookHandler,
} from '@nestjs-shopify/webhooks';

@WebhookHandler('PRODUCTS_CREATE')
export class CustomersCreateWebhookHandler extends ShopifyWebhookHandler {
  async handle(shop: string, product: unknown): Promise<void> {
    console.log(shop, product);
  }
}
```

Make sure you add all `ShopifyWebhookHandler` classes to the `providers` definition of the `AppModule` as shown in all examples.

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
import { CustomersCreateWebhookHandler } from './customers-create.webhook-handler.ts';

@Module({
  imports: [
    ShopifyCoreModule.forRoot({
      apiKey: 'foo',
      apiSecretKey: 'bar',
      apiVersion: ApiVersion.Unstable,
      hostName: 'localhost:8081',
      isEmbeddedApp: true,
      scopes: ['test_scope'],
    }),
    ShopifyWebhooksModule.forRootAsync({
      useFactory: () => ({
        path: '/shopify-webhooks',
      }),
    }),
  ],
  providers: [CustomersCreateWebhookHandler],
})
export class AppModule {}
```

## Registering webhooks in Shopify API

This module exports the `ShopifyWebhooksService`. Call this service with an **offline** access token to register your webhooks:

```ts
// my-auth.handler.ts
import { ShopifyAuthAfterHandler } from '@nestjs-shopify/auth';
import { ShopifyWebhooksService } from '@nestjs-shopify/webhooks';

@Injectable()
export class MyAuthHandler implements ShopifyAuthAfterHandler {
  constructor(private readonly webhooksService: ShopifyWebhooksService) {}
  async afterAuth(req: Request, res: Response, session: SessionInterface) {
    if (session.isOnline) {
      // redirect to homepage of your app etc...
      return;
    }

    // Otherwise, we have an offline access token
    const { shop, accessToken } = session;
    await this.webhooksService.registerWebhooks({
      shop,
      accessToken,
    });

    // Your other logic for offline auth...
  }
}
```
