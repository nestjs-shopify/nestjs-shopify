import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ShopifyExpressModuleOptions } from './interfaces/express-module-options.interface';

export const {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
} = new ConfigurableModuleBuilder<ShopifyExpressModuleOptions>({
  moduleName: 'ShopifyExpress',
})
  .setExtras({}, (definition) => ({
    ...definition,
    global: true,
  }))
  .setClassMethodName('forRoot')
  .build();
