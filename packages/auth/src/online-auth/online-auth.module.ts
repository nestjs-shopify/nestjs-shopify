import { DynamicModule, Module } from '@nestjs/common';
import {
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthModuleOptions,
} from '../auth.interfaces';
import { buildControllerHackForToken } from '../utils/build-controller-hack-for-token.util';
import { buildProviderForToken } from '../utils/build-provider-for-token.util';
import { ShopifyGraphqlController } from './graphql.controller';
import {
  SHOPIFY_ONLINE_AUTH_CONTROLLER_HACK,
  SHOPIFY_ONLINE_AUTH_OPTIONS,
} from './online-auth.constants';
import { ShopifyAuthOnlineController } from './online-auth.controller';
import { ShopifyAuthOnlineGuard } from './online-auth.guard';

@Module({
  controllers: [ShopifyAuthOnlineController, ShopifyGraphqlController],
  providers: [ShopifyAuthOnlineGuard],
  exports: [SHOPIFY_ONLINE_AUTH_OPTIONS],
})
export class ShopifyAuthOnlineModule {
  static forRoot(options: ShopifyAuthModuleOptions): DynamicModule {
    return {
      module: ShopifyAuthOnlineModule,
      global: true,
      providers: [
        {
          provide: SHOPIFY_ONLINE_AUTH_OPTIONS,
          useValue: options,
        },
        buildControllerHackForToken(
          SHOPIFY_ONLINE_AUTH_OPTIONS,
          SHOPIFY_ONLINE_AUTH_CONTROLLER_HACK,
          ShopifyAuthOnlineController
        ),
      ],
    };
  }

  static forRootAsync(options: ShopifyAuthModuleAsyncOptions): DynamicModule {
    return {
      module: ShopifyAuthOnlineModule,
      global: true,
      imports: options.imports || [],
      providers: [
        ...buildProviderForToken(options, SHOPIFY_ONLINE_AUTH_OPTIONS),
        buildControllerHackForToken(
          SHOPIFY_ONLINE_AUTH_OPTIONS,
          SHOPIFY_ONLINE_AUTH_CONTROLLER_HACK,
          ShopifyAuthOnlineController
        ),
      ],
    };
  }
}
