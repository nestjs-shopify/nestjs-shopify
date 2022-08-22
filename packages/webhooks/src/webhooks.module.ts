import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { ShopifyWebhooksMetadataAccessor } from './webhooks-metadata.accessor';
import { SHOPIFY_WEBHOOKS_OPTIONS } from './webhooks.constants';
import { ShopifyWebhooksController } from './webhooks.controller';
import { ShopifyWebhooksExplorer } from './webhooks.explorer';
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
  providers: [
    ShopifyWebhooksService,
    ShopifyWebhooksExplorer,
    ShopifyWebhooksMetadataAccessor,
  ],
  exports: [ShopifyWebhooksService],
})
export class ShopifyWebhooksModule {
  static forRoot(options: ShopifyWebhooksOptions): DynamicModule {
    return {
      module: ShopifyWebhooksModule,
      global: true,
      imports: [DiscoveryModule],
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
      imports: [...(options.imports || []), DiscoveryModule],
      providers: [...createShopifyWebhooksAsyncOptionsProviders(options)],
      exports: [SHOPIFY_WEBHOOKS_OPTIONS],
    };
  }
}
