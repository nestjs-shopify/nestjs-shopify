import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigParams, shopifyApi } from '@shopify/shopify-api';
import { SHOPIFY_API_CONTEXT } from './core.constants';
import {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} from './core.module-builder';

@Module({
  providers: [
    {
      provide: SHOPIFY_API_CONTEXT,
      useFactory: (options: ConfigParams) => shopifyApi(options),
      inject: [MODULE_OPTIONS_TOKEN],
    },
  ],
  exports: [SHOPIFY_API_CONTEXT],
})
export class ShopifyCoreModule
  extends ConfigurableModuleClass
  implements OnModuleInit {}
