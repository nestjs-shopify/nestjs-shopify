import { Module } from '@nestjs/common';
import { shopifyApi } from '@shopify/shopify-api';
import {
  SHOPIFY_API_CONTEXT,
  SHOPIFY_API_SESSION_STORAGE,
} from './core.constants';
import { ShopifyCoreOptions } from './core.interfaces';
import {
  ConfigurableModuleClass,
  SHOPIFY_CORE_OPTIONS,
} from './core.module-builder';

@Module({
  providers: [
    {
      provide: SHOPIFY_API_CONTEXT,
      useFactory: (options: ShopifyCoreOptions) => shopifyApi(options),
      inject: [SHOPIFY_CORE_OPTIONS],
    },
    {
      provide: SHOPIFY_API_SESSION_STORAGE,
      useFactory: (options: ShopifyCoreOptions) => options.sessionStorage,
      inject: [SHOPIFY_CORE_OPTIONS],
    },
  ],
  exports: [
    SHOPIFY_API_CONTEXT,
    SHOPIFY_CORE_OPTIONS,
    SHOPIFY_API_SESSION_STORAGE,
  ],
})
export class ShopifyCoreModule extends ConfigurableModuleClass {}
