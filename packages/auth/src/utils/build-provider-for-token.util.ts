import { Provider, Type } from '@nestjs/common';
import {
  GenericShopifyAuthModuleAsyncOptions,
  ShopifyAuthOptionsFactory,
} from '../auth.interfaces';

export function buildProvidersForToken<Options>(
  asyncOptions: GenericShopifyAuthModuleAsyncOptions<Options>,
  token: string,
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

export function createAsyncOptionsProvider<Options>(
  options: GenericShopifyAuthModuleAsyncOptions<Options>,
  token: string,
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
    useFactory: (optionsFactory: ShopifyAuthOptionsFactory<Options>) =>
      optionsFactory.createShopifyAuthOptions(),
    inject: [
      (options.useExisting || options.useClass) as Type<
        ShopifyAuthOptionsFactory<Options>
      >,
    ],
  };
}
