import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ShopifyWebhooksOptions } from './webhooks.interfaces';

export const {
  ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: SHOPIFY_WEBHOOKS_OPTIONS,
} = new ConfigurableModuleBuilder<ShopifyWebhooksOptions>()
  .setClassMethodName('forRoot')
  .setFactoryMethodName('createShopifyWebhookOptions')
  .setExtras({}, (definition) => ({
    ...definition,
    global: true,
  }))
  .build();
