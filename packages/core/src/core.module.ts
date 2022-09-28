import { Module } from '@nestjs/common';
import { ConfigParams, shopifyApi } from '@shopify/shopify-api';
import { SHOPIFY_API_CONTEXT } from './core.constants';
import {
  ConfigurableModuleClass,
  SHOPIFY_CORE_OPTIONS,
} from './core.module-builder';

@Module({
  providers: [
    {
      provide: SHOPIFY_API_CONTEXT,
      useFactory: (options: ConfigParams) => shopifyApi(options),
      inject: [SHOPIFY_CORE_OPTIONS],
    },
  ],
  exports: [SHOPIFY_API_CONTEXT, SHOPIFY_CORE_OPTIONS],
})
export class ShopifyCoreModule extends ConfigurableModuleClass {}
