import { Provider, Type } from '@nestjs/common';
import {
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthOptionsFactory,
} from '../auth.interfaces';

export function buildProvidersForToken(
  asyncOptions: ShopifyAuthModuleAsyncOptions,
  token: string
): Provider[] {
  if (asyncOptions.useExisting || asyncOptions.useFactory) {
    return [createAsyncOptionsProvider(asyncOptions, token)];
  }

  if (asyncOptions.useClass) {
    return [
      createAsyncOptionsProvider(asyncOptions, token),
      {
        provide: asyncOptions.useClass,
        useClass: asyncOptions.useClass,
      },
    ];
  }

  return [];
}

export function createAsyncOptionsProvider(
  options: ShopifyAuthModuleAsyncOptions,
  token: string
): Provider {
  if (options.useFactory) {
    return {
      provide: token,
      useFactory: options.useFactory,
      inject: options.inject,
    };
  }

  return {
    provide: token,
    useFactory: (optionsFactory: ShopifyAuthOptionsFactory) =>
      optionsFactory.createShopifyAuthOptions(),
    inject: [
      (options.useExisting ||
        options.useClass) as Type<ShopifyAuthOptionsFactory>,
    ],
  };
}
