import { ModuleMetadata, Scope, Type } from '@nestjs/common';

export interface ShopifyWebhooksOptions {
  path?: string;
}

export interface ShopifyWebhookHandlerOptions {
  topic: string;
  scope?: Scope;
}

export abstract class ShopifyWebhookHandler<T = unknown> {
  abstract handle(shop: string, data: T): Promise<void>;
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
