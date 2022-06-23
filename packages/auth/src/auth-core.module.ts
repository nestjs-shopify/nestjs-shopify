import { DynamicModule, Module, Provider } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import {
  SHOPIFY_ACCESS_MODE,
  SHOPIFY_AUTH_CONTROLLER_HACK,
  SHOPIFY_AUTH_OPTIONS,
} from './auth.constants';
import { ShopifyAuthOnlineController } from './controllers/auth.controller';
import { ShopifyGraphqlController } from './controllers/graphql.controller';
import { ShopifyAuthGuard } from './auth.guard';
import {
  AccessMode,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthModuleOptions,
  ShopifyAuthOptionsFactory,
} from './auth.interfaces';

@Module({})
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
        },
        {
          provide: SHOPIFY_ACCESS_MODE,
          useValue: mode,
        },
        ShopifyAuthGuard,
        this.createShopifyAuthControllerHackProvider(),
      ],
      controllers: [ShopifyAuthOnlineController, ShopifyGraphqlController],
      exports: [SHOPIFY_AUTH_OPTIONS, SHOPIFY_ACCESS_MODE],
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
        },
        ShopifyAuthGuard,
      ],
      controllers: [ShopifyAuthOnlineController, ShopifyGraphqlController],
      exports: [SHOPIFY_AUTH_OPTIONS, SHOPIFY_ACCESS_MODE],
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
    };
  }

  private static createShopifyAuthControllerHackProvider(): Provider {
    return {
      provide: SHOPIFY_AUTH_CONTROLLER_HACK,
      useFactory: ({ basePath }: ShopifyAuthModuleOptions) => {
        if (basePath) {
          Reflect.defineMetadata(
            PATH_METADATA,
            basePath,
            ShopifyAuthOnlineController
          );
        }
      },
      inject: [SHOPIFY_AUTH_OPTIONS],
    };
  }
}
