import { DynamicModule } from '@nestjs/common';
import {
  AuthStrategy,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthorizationCodeAuthModuleOptions,
  ShopifyAuthModuleOptions,
  ShopifyTokenExchangeAuthModuleOptions,
} from './auth.interfaces';
import { ShopifyAuthorizationCodeAuthModule } from './authorization-code/authorization-code-auth.module';
import { ShopifyTokenExchangeAuthModule } from './token-exchange/token-exchange-auth.module';

export class ShopifyAuthModule {
  static forRootOnline(
    options: ShopifyAuthorizationCodeAuthModuleOptions,
    authStrategy?: 'AUTHORIZATION_CODE_FLOW',
  ): DynamicModule;
  static forRootOnline(
    options: ShopifyTokenExchangeAuthModuleOptions,
    authStrategy?: 'TOKEN_EXCHANGE',
  ): DynamicModule;
  static forRootOnline(
    options: ShopifyAuthModuleOptions,
    authStrategy: AuthStrategy = 'AUTHORIZATION_CODE_FLOW',
  ): DynamicModule {
    const authStrategyModule =
      authStrategy === 'TOKEN_EXCHANGE'
        ? ShopifyTokenExchangeAuthModule.forRootOnline(
            options as ShopifyTokenExchangeAuthModuleOptions,
          )
        : ShopifyAuthorizationCodeAuthModule.forRootOnline(
            options as ShopifyAuthorizationCodeAuthModuleOptions,
          );

    return {
      module: class ShopifyAuthOnlineModule {},
      global: true,
      imports: [authStrategyModule],
      exports: [authStrategyModule],
    };
  }

  static forRootOffline(
    options: ShopifyAuthorizationCodeAuthModuleOptions,
    authStrategy?: 'AUTHORIZATION_CODE_FLOW',
  ): DynamicModule;
  static forRootOffline(
    options: ShopifyTokenExchangeAuthModuleOptions,
    authStrategy?: 'TOKEN_EXCHANGE',
  ): DynamicModule;
  static forRootOffline(
    options: ShopifyAuthModuleOptions,
    authStrategy: AuthStrategy = 'AUTHORIZATION_CODE_FLOW',
  ): DynamicModule {
    const authStrategyModule =
      authStrategy === 'TOKEN_EXCHANGE'
        ? ShopifyTokenExchangeAuthModule.forRootOffline(
            options as ShopifyTokenExchangeAuthModuleOptions,
          )
        : ShopifyAuthorizationCodeAuthModule.forRootOffline(
            options as ShopifyAuthorizationCodeAuthModuleOptions,
          );

    return {
      module: class ShopifyAuthOfflineModule {},
      global: true,
      imports: [authStrategyModule],
      exports: [authStrategyModule],
    };
  }

  static forRootAsyncOnline(
    options: ShopifyAuthModuleAsyncOptions<
      'AUTHORIZATION_CODE_FLOW',
      ShopifyAuthorizationCodeAuthModuleOptions
    >,
    authStrategy?: 'AUTHORIZATION_CODE_FLOW',
  ): DynamicModule;
  static forRootAsyncOnline(
    options: ShopifyAuthModuleAsyncOptions<
      'TOKEN_EXCHANGE',
      ShopifyTokenExchangeAuthModuleOptions
    >,
    authStrategy?: 'TOKEN_EXCHANGE',
  ): DynamicModule;
  static forRootAsyncOnline(
    options: ShopifyAuthModuleAsyncOptions<
      AuthStrategy,
      ShopifyAuthModuleOptions
    >,
    authStrategy: AuthStrategy = 'AUTHORIZATION_CODE_FLOW',
  ): DynamicModule {
    const authStrategyModule =
      authStrategy === 'TOKEN_EXCHANGE'
        ? ShopifyTokenExchangeAuthModule.forRootAsyncOnline(
            options as ShopifyAuthModuleAsyncOptions<
              'TOKEN_EXCHANGE',
              ShopifyTokenExchangeAuthModuleOptions
            >,
          )
        : ShopifyAuthorizationCodeAuthModule.forRootAsyncOnline(
            options as ShopifyAuthModuleAsyncOptions<
              'AUTHORIZATION_CODE_FLOW',
              ShopifyAuthorizationCodeAuthModuleOptions
            >,
          );

    return {
      module: class ShopifyAuthOnlineModule {},
      global: true,
      imports: [authStrategyModule],
      exports: [authStrategyModule],
    };
  }

  static forRootAsyncOffline(
    options: ShopifyAuthModuleAsyncOptions<
      'AUTHORIZATION_CODE_FLOW',
      ShopifyAuthorizationCodeAuthModuleOptions
    >,
    authStrategy?: 'AUTHORIZATION_CODE_FLOW',
  ): DynamicModule;
  static forRootAsyncOffline(
    options: ShopifyAuthModuleAsyncOptions<
      'TOKEN_EXCHANGE',
      ShopifyTokenExchangeAuthModuleOptions
    >,
    authStrategy?: 'TOKEN_EXCHANGE',
  ): DynamicModule;
  static forRootAsyncOffline(
    options: ShopifyAuthModuleAsyncOptions<
      AuthStrategy,
      ShopifyAuthModuleOptions
    >,
    authStrategy: AuthStrategy = 'AUTHORIZATION_CODE_FLOW',
  ): DynamicModule {
    const authStrategyModule =
      authStrategy === 'TOKEN_EXCHANGE'
        ? ShopifyTokenExchangeAuthModule.forRootAsyncOffline(
            options as ShopifyAuthModuleAsyncOptions<
              'TOKEN_EXCHANGE',
              ShopifyTokenExchangeAuthModuleOptions
            >,
          )
        : ShopifyAuthorizationCodeAuthModule.forRootAsyncOffline(
            options as ShopifyAuthModuleAsyncOptions<
              'AUTHORIZATION_CODE_FLOW',
              ShopifyAuthorizationCodeAuthModuleOptions
            >,
          );

    return {
      module: class ShopifyAuthOfflineModule {},
      global: true,
      imports: [authStrategyModule],
      exports: [authStrategyModule],
    };
  }
}
