import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ShopifyCoreOptions } from './core.interfaces';

export const {
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: SHOPIFY_CORE_OPTIONS,
} = new ConfigurableModuleBuilder<ShopifyCoreOptions, 'forRoot'>()
  .setClassMethodName('forRoot')
  .setExtras({}, (definition) => ({
    ...definition,
    global: true,
  }))
  .build();
