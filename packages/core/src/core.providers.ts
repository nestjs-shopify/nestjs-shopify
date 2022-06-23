import { Provider } from '@nestjs/common';
import { SHOPIFY_CORE_OPTIONS } from './core.constants';
import {
  ShopifyCoreAsyncOptions,
  ShopifyCoreOptionsFactory,
} from './core.interfaces';

export function createShopifyCoreAsyncOptionsProviders(
  options: ShopifyCoreAsyncOptions
): Provider[] {
  if (options.useExisting || options.useFactory) {
    return [createShopifyCoreAsyncOptionsProvider(options)];
  }

  if (options.useClass) {
    return [
      createShopifyCoreAsyncOptionsProvider(options),
      { provide: options.useClass, useClass: options.useClass },
    ];
  }

  throw new Error(
    'Invalid ShopifyCore options: one of `useClass`, `useExisting` or `useFactory` should be defined.'
  );
}

export function createShopifyCoreAsyncOptionsProvider(
  options: ShopifyCoreAsyncOptions
): Provider {
  if (options.useFactory) {
    return {
      provide: SHOPIFY_CORE_OPTIONS,
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
    provide: SHOPIFY_CORE_OPTIONS,
    useFactory: (optionsFactory: ShopifyCoreOptionsFactory) =>
      optionsFactory.createShopifyCoreOptions(),
    inject,
  };
}
