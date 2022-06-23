import { ModuleMetadata, Type } from '@nestjs/common';

export interface ShopifyWebhooksOptions {
  path: string;
  topics: string[];
  handler: ShopifyWebhooksHandler;
}

export interface ShopifyWebhooksHandler {
  process: (topic: string, shop_domain: string, body: string) => Promise<void>;
}

export interface ShopifyWebhooksOptionsFactory {
  createShopifyWebhookOptions():
    | Promise<ShopifyWebhooksOptions>
    | ShopifyWebhooksOptions;
}

export interface ShopifyWebhooksAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ShopifyWebhooksOptionsFactory>;
  useClass?: Type<ShopifyWebhooksOptionsFactory>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  useFactory?: (
    ...args: any[]
  ) => Promise<ShopifyWebhooksOptions> | ShopifyWebhooksOptions;
  inject?: any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
