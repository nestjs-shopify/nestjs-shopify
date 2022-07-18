import { DynamicModule, Module, Provider, Scope } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import {
  SHOPIFY_ACCESS_MODE,
  SHOPIFY_AUTH_CONTROLLER_HACK,
  SHOPIFY_AUTH_OPTIONS,
} from './auth.constants';
import {
  ShopifyAuthOfflineController,
  ShopifyAuthOnlineController,
} from './controllers/auth.controller';
import {
  AccessMode,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthModuleOptions,
  ShopifyAuthOptionsFactory,
} from './auth.interfaces';
import { getControllersByAccessMode } from './utils/get-controllers-by-access-mode.util';

@Module({
  exports: [SHOPIFY_AUTH_OPTIONS, SHOPIFY_ACCESS_MODE],
})
export class ShopifyAuthCoreModule {
  static forRoot(
    mode: AccessMode,
    options: ShopifyAuthModuleOptions
  ): DynamicModule {
    return {
      module: ShopifyAuthCoreModule,
      providers: [
        {
          provide: SHOPIFY_AUTH_OPTIONS,
          useValue: options,
          scope: Scope.TRANSIENT,
        },
        {
          provide: SHOPIFY_ACCESS_MODE,
          useValue: mode,
          scope: Scope.TRANSIENT,
        },
        this.createShopifyAuthControllerHackProvider(),
      ],
      controllers: [...getControllersByAccessMode(mode)],
    };
  }

  static forRootAsync(
    mode: AccessMode,
    options: ShopifyAuthModuleAsyncOptions
  ): DynamicModule {
    return {
      module: ShopifyAuthCoreModule,
      imports: options.imports || [],
      providers: [
        ...this.createShopifyAuthModuleAsyncOptions(options),
        {
          provide: SHOPIFY_ACCESS_MODE,
          useValue: mode,
          scope: Scope.TRANSIENT,
        },
      ],
      controllers: [...getControllersByAccessMode(mode)],
    };
  }

  private static createShopifyAuthModuleAsyncOptions(
    options: ShopifyAuthModuleAsyncOptions
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [
        this.createShopifyAuthModuleAsyncOptionsProvider(options),
        this.createShopifyAuthControllerHackProvider(),
      ];
    }

    if (options.useClass) {
      return [
        { provide: options.useClass, useClass: options.useClass },
        this.createShopifyAuthModuleAsyncOptionsProvider(options),
        this.createShopifyAuthControllerHackProvider(),
      ];
    }

    throw new Error(
      'Invalid ShopifyAuth options: one of `useClass`, `useExisting` or `useFactory` should be defined.'
    );
  }

  private static createShopifyAuthModuleAsyncOptionsProvider(
    options: ShopifyAuthModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: SHOPIFY_AUTH_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject,
        scope: Scope.TRANSIENT,
      };
    }

    const inject = [];

    if (options.useClass) {
      inject.push(options.useClass);
    } else if (options.useExisting) {
      inject.push(options.useExisting);
    }

    return {
      provide: SHOPIFY_AUTH_OPTIONS,
      useFactory: (optionsFactory: ShopifyAuthOptionsFactory) =>
        optionsFactory.createShopifyAuthOptions(),
      inject,
      scope: Scope.TRANSIENT,
    };
  }

  private static createShopifyAuthControllerHackProvider(): Provider {
    return {
      provide: SHOPIFY_AUTH_CONTROLLER_HACK,
      useFactory: (
        { basePath }: ShopifyAuthModuleOptions,
        mode: AccessMode
      ) => {
        if (basePath) {
          Reflect.defineMetadata(
            PATH_METADATA,
            basePath,
            mode === AccessMode.Online
              ? ShopifyAuthOnlineController
              : ShopifyAuthOfflineController
          );
        }
      },
      inject: [SHOPIFY_AUTH_OPTIONS, SHOPIFY_ACCESS_MODE],
    };
  }
}
