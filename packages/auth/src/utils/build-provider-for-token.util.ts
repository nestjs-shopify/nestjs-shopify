import { Provider, Type } from '@nestjs/common';
import {
  AuthStrategy,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthorizationCodeAuthModuleOptions,
  ShopifyTokenExchangeAuthModuleOptions,
  ShopifyAuthOptionsFactory,
} from '../auth.interfaces';

export function buildProvidersForToken<A extends AuthStrategy>(
  asyncOptions: ShopifyAuthModuleAsyncOptions<A>,
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

export function createAsyncOptionsProvider<
  A extends AuthStrategy,
  O = A extends 'AUTHORIZATION_CODE_FLOW'
    ? ShopifyAuthorizationCodeAuthModuleOptions
    : ShopifyTokenExchangeAuthModuleOptions,
>(options: ShopifyAuthModuleAsyncOptions<A>, token: string): Provider {
  if (options.useFactory) {
    return {
      provide: token,
      useFactory: options.useFactory,
      inject: options.inject,
    };
  }

  return {
    provide: token,
    useFactory: (optionsFactory: ShopifyAuthOptionsFactory<O>) =>
      optionsFactory.createShopifyAuthOptions(),
    inject: [
      (options.useExisting || options.useClass) as Type<
        ShopifyAuthOptionsFactory<O>
      >,
    ],
  };
}
