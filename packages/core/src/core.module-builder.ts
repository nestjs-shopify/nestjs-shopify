import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ConfigInterface } from '@shopify/shopify-api';

export const {
  ASYNC_OPTIONS_TYPE,
  OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: SHOPIFY_CORE_OPTIONS,
} = new ConfigurableModuleBuilder<ConfigInterface, 'forRoot'>()
  .setClassMethodName('forRoot')
  .setExtras({}, (definition) => ({
    ...definition,
    global: true,
  }))
  .build();
