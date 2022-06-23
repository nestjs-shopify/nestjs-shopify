import { Provider } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import {
  SHOPIFY_WEBHOOKs_CONTROLLER_PATH_HACK,
  SHOPIFY_WEBHOOKS_OPTIONS,
} from './webhooks.constants';
import { ShopifyWebhooksController } from './webhooks.controller';
import {
  ShopifyWebhooksAsyncOptions,
  ShopifyWebhooksOptions,
  ShopifyWebhooksOptionsFactory,
} from './webhooks.interfaces';

export function createShopifyWebhooksAsyncOptionsProviders(
  options: ShopifyWebhooksAsyncOptions
): Provider[] {
  if (options.useExisting || options.useFactory) {
    return [
      createShopifyWebhooksAsyncOptionsProvider(options),
      shopifyWebhooksControllerPathHackProvider,
    ];
  }

  if (options.useClass) {
    return [
      { provide: options.useClass, useClass: options.useClass },
      createShopifyWebhooksAsyncOptionsProvider(options),
      shopifyWebhooksControllerPathHackProvider,
    ];
  }

  throw new Error(
    'Invalid ShopifyWebhooks options: one of `useClass`, `useExisting` or `useFactory` should be defined.'
  );
}

export function createShopifyWebhooksAsyncOptionsProvider(
  options: ShopifyWebhooksAsyncOptions
): Provider {
  if (options.useFactory) {
    return {
      provide: SHOPIFY_WEBHOOKS_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };
  }

  const inject = [];

  if (options.useClass) {
    inject.push(options.useClass);
  } else if (options.useExisting) {
    inject.push(options.useExisting);
  }

  return {
    provide: SHOPIFY_WEBHOOKS_OPTIONS,
    useFactory: (optionsFactory: ShopifyWebhooksOptionsFactory) =>
      optionsFactory.createShopifyWebhookOptions(),
    inject,
  };
}

export const shopifyWebhooksControllerPathHackProvider: Provider = {
  provide: SHOPIFY_WEBHOOKs_CONTROLLER_PATH_HACK,
  useFactory: (options: ShopifyWebhooksOptions) => {
    Reflect.defineMetadata(
      PATH_METADATA,
      options.path,
      ShopifyWebhooksController
    );
  },
  inject: [SHOPIFY_WEBHOOKS_OPTIONS],
};
