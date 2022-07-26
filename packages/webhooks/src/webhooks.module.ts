import { DynamicModule, Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Shopify from '@shopify/shopify-api';
import { SHOPIFY_WEBHOOKS_OPTIONS } from './webhooks.constants';
import { ShopifyWebhooksController } from './webhooks.controller';
import {
  ShopifyWebhooksAsyncOptions,
  ShopifyWebhooksOptions,
} from './webhooks.interfaces';
import {
  createShopifyWebhooksAsyncOptionsProviders,
  shopifyWebhooksControllerPathHackProvider,
} from './webhooks.providers';
import { ShopifyWebhooksService } from './webhooks.service';

@Module({
  controllers: [ShopifyWebhooksController],
  providers: [ShopifyWebhooksService],
  exports: [ShopifyWebhooksService],
})
export class ShopifyWebhooksModule implements OnModuleInit {
  static forRoot(options: ShopifyWebhooksOptions): DynamicModule {
    return {
      module: ShopifyWebhooksModule,
      global: true,
      providers: [
        {
          provide: SHOPIFY_WEBHOOKS_OPTIONS,
          useValue: options,
        },
        shopifyWebhooksControllerPathHackProvider,
      ],
      exports: [SHOPIFY_WEBHOOKS_OPTIONS],
    };
  }

  static forRootAsync(options: ShopifyWebhooksAsyncOptions): DynamicModule {
    return {
      module: ShopifyWebhooksModule,
      global: true,
      imports: options.imports || [],
      providers: [...createShopifyWebhooksAsyncOptionsProviders(options)],
      exports: [SHOPIFY_WEBHOOKS_OPTIONS],
    };
  }

  constructor(private readonly moduleRef: ModuleRef) {}

  onModuleInit() {
    const options = this.moduleRef.get<ShopifyWebhooksOptions>(
      SHOPIFY_WEBHOOKS_OPTIONS,
      {
        strict: true,
      }
    );

    options.topics.forEach((topic: string) => {
      Shopify.Webhooks.Registry.addHandler(topic, {
        path: options.path,
        webhookHandler: (topic, shop, body) =>
          options.handler.process(topic, shop, body),
      });
    });
  }
}
