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
import { ConfigurableModuleClass } from './webhooks.module-builder';
import { shopifyWebhooksControllerPathHackProvider } from './webhooks.providers';
import { ShopifyWebhooksService } from './webhooks.service';

@Module({
  imports: [DiscoveryModule],
  controllers: [ShopifyWebhooksController],
  providers: [
    ShopifyWebhooksService,
    ShopifyWebhooksExplorer,
    ShopifyWebhooksMetadataAccessor,
  ],
  exports: [ShopifyWebhooksService, SHOPIFY_WEBHOOKS_OPTIONS],
})
export class ShopifyWebhooksModule extends ConfigurableModuleClass {
  static forRoot(options: ShopifyWebhooksOptions): DynamicModule {
    const module = super.forRoot(options);
    return {
      ...module,
      providers: [
        ...(module.providers || []),
        shopifyWebhooksControllerPathHackProvider,
      ],
    };
  }

  static forRootAsync(options: ShopifyWebhooksAsyncOptions): DynamicModule {
    const module = super.forRootAsync(options);

    return {
      ...module,
      providers: [
        ...(module.providers || []),
        shopifyWebhooksControllerPathHackProvider,
      ],
    };
  }
}
