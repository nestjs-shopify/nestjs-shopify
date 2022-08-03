import { DynamicModule, Module } from '@nestjs/common';
import {
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthModuleOptions,
} from '../auth.interfaces';
import { buildControllerHackForToken } from '../utils/build-controller-hack-for-token.util';
import { buildProviderForToken } from '../utils/build-provider-for-token.util';
import {
  SHOPIFY_OFFLINE_AUTH_CONTROLLER_HACK,
  SHOPIFY_OFFLINE_AUTH_OPTIONS,
} from './offline-auth.constants';
import { ShopifyAuthOfflineController } from './offline-auth.controller';
import { ShopifyAuthOfflineGuard } from './offline-auth.guard';

@Module({
  providers: [ShopifyAuthOfflineGuard],
  controllers: [ShopifyAuthOfflineController],
  exports: [SHOPIFY_OFFLINE_AUTH_OPTIONS],
})
export class ShopifyAuthOfflineModule {
  static forRoot(options: ShopifyAuthModuleOptions): DynamicModule {
    return {
      module: ShopifyAuthOfflineModule,
      global: true,
      providers: [
        {
          provide: SHOPIFY_OFFLINE_AUTH_OPTIONS,
          useValue: options,
        },
        buildControllerHackForToken(
          SHOPIFY_OFFLINE_AUTH_OPTIONS,
          SHOPIFY_OFFLINE_AUTH_CONTROLLER_HACK,
          ShopifyAuthOfflineController
        ),
      ],
    };
  }

  static forRootAsync(options: ShopifyAuthModuleAsyncOptions): DynamicModule {
    return {
      module: ShopifyAuthOfflineModule,
      global: true,
      imports: options.imports || [],
      providers: [
        ...buildProviderForToken(options, SHOPIFY_OFFLINE_AUTH_OPTIONS),
        buildControllerHackForToken(
          SHOPIFY_OFFLINE_AUTH_OPTIONS,
          SHOPIFY_OFFLINE_AUTH_CONTROLLER_HACK,
          ShopifyAuthOfflineController
        ),
      ],
    };
  }
}
