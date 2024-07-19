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
  ): DynamicModule;
  static forRootOnline(
    authStrategy: AuthStrategy.AuthorizationCode,
    options: ShopifyAuthorizationCodeAuthModuleOptions,
  ): DynamicModule;
  static forRootOnline(
    authStrategy: AuthStrategy.TokenExchange,
    options: ShopifyTokenExchangeAuthModuleOptions,
  ): DynamicModule;
  static forRootOnline(
    optionsOrStrategy: ShopifyAuthorizationCodeAuthModuleOptions | AuthStrategy,
    optionalOptions?: ShopifyAuthModuleOptions,
  ): DynamicModule {
    const authStrategy =
      typeof optionsOrStrategy === 'object'
        ? AuthStrategy.AuthorizationCode
        : optionsOrStrategy;

    const options =
      typeof optionsOrStrategy === 'object'
        ? optionsOrStrategy
        : optionalOptions;

    const authStrategyModule =
      authStrategy === AuthStrategy.TokenExchange
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
  ): DynamicModule;
  static forRootOffline(
    authStrategy: AuthStrategy.AuthorizationCode,
    options: ShopifyAuthorizationCodeAuthModuleOptions,
  ): DynamicModule;
  static forRootOffline(
    authStrategy: AuthStrategy.TokenExchange,
    options: ShopifyTokenExchangeAuthModuleOptions,
  ): DynamicModule;
  static forRootOffline(
    optionsOrStrategy: ShopifyAuthorizationCodeAuthModuleOptions | AuthStrategy,
    optionalOptions?: ShopifyAuthModuleOptions,
  ): DynamicModule {
    const authStrategy =
      typeof optionsOrStrategy === 'object'
        ? AuthStrategy.AuthorizationCode
        : optionsOrStrategy;

    const options =
      typeof optionsOrStrategy === 'object'
        ? optionsOrStrategy
        : optionalOptions;

    const authStrategyModule =
      authStrategy === AuthStrategy.TokenExchange
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
    options: ShopifyAuthModuleAsyncOptions<AuthStrategy.AuthorizationCode>,
  ): DynamicModule;
  static forRootAsyncOnline(
    authStrategy: AuthStrategy.AuthorizationCode,
    options: ShopifyAuthModuleAsyncOptions<AuthStrategy.AuthorizationCode>,
  ): DynamicModule;
  static forRootAsyncOnline(
    authStrategy: AuthStrategy.TokenExchange,
    options: ShopifyAuthModuleAsyncOptions<AuthStrategy.TokenExchange>,
  ): DynamicModule;
  static forRootAsyncOnline(
    optionsOrStrategy:
      | ShopifyAuthModuleAsyncOptions<AuthStrategy.AuthorizationCode>
      | AuthStrategy,
    optionalOptions?: ShopifyAuthModuleAsyncOptions<AuthStrategy>,
  ): DynamicModule {
    const authStrategy =
      typeof optionsOrStrategy === 'object'
        ? AuthStrategy.AuthorizationCode
        : optionsOrStrategy;

    const options =
      typeof optionsOrStrategy === 'object'
        ? optionsOrStrategy
        : optionalOptions;

    const authStrategyModule =
      authStrategy === AuthStrategy.TokenExchange
        ? ShopifyTokenExchangeAuthModule.forRootAsyncOnline(
            options as ShopifyAuthModuleAsyncOptions<AuthStrategy.TokenExchange>,
          )
        : ShopifyAuthorizationCodeAuthModule.forRootAsyncOnline(
            options as ShopifyAuthModuleAsyncOptions<AuthStrategy.AuthorizationCode>,
          );

    return {
      module: class ShopifyAuthOnlineModule {},
      global: true,
      imports: [authStrategyModule],
      exports: [authStrategyModule],
    };
  }

  static forRootAsyncOffline(
    options: ShopifyAuthModuleAsyncOptions<AuthStrategy.AuthorizationCode>,
  ): DynamicModule;
  static forRootAsyncOffline(
    authStrategy: AuthStrategy.AuthorizationCode,
    options: ShopifyAuthModuleAsyncOptions<AuthStrategy.AuthorizationCode>,
  ): DynamicModule;
  static forRootAsyncOffline(
    authStrategy: AuthStrategy.TokenExchange,
    options: ShopifyAuthModuleAsyncOptions<AuthStrategy.TokenExchange>,
  ): DynamicModule;
  static forRootAsyncOffline(
    optionsOrStrategy:
      | ShopifyAuthModuleAsyncOptions<AuthStrategy.AuthorizationCode>
      | AuthStrategy,
    optionalOptions?: ShopifyAuthModuleAsyncOptions<AuthStrategy>,
  ): DynamicModule {
    const authStrategy =
      typeof optionsOrStrategy === 'object'
        ? AuthStrategy.AuthorizationCode
        : optionsOrStrategy;
    const options =
      typeof optionsOrStrategy === 'object'
        ? optionsOrStrategy
        : optionalOptions;

    const authStrategyModule =
      authStrategy === AuthStrategy.TokenExchange
        ? ShopifyTokenExchangeAuthModule.forRootAsyncOffline(
            options as ShopifyAuthModuleAsyncOptions<AuthStrategy.TokenExchange>,
          )
        : ShopifyAuthorizationCodeAuthModule.forRootAsyncOffline(
            options as ShopifyAuthModuleAsyncOptions<AuthStrategy.AuthorizationCode>,
          );

    return {
      module: class ShopifyAuthOfflineModule {},
      global: true,
      imports: [authStrategyModule],
      exports: [authStrategyModule],
    };
  }
}
