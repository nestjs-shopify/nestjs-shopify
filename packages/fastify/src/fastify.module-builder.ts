import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ShopifyFastifyModuleOptions } from './interfaces/fastify-module-options.interface';

export const {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<ShopifyFastifyModuleOptions>()
  .setExtras({}, (definition) => ({
    ...definition,
    global: true,
  }))
  .setClassMethodName('forRoot')
  .build();
