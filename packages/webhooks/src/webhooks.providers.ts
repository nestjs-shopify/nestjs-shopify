import { Provider } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import {
  SHOPIFY_WEBHOOKs_CONTROLLER_PATH_HACK,
  SHOPIFY_WEBHOOKS_OPTIONS,
} from './webhooks.constants';
import { ShopifyWebhooksController } from './webhooks.controller';
import { ShopifyWebhooksOptions } from './webhooks.interfaces';

export const shopifyWebhooksControllerPathHackProvider: Provider = {
  provide: SHOPIFY_WEBHOOKs_CONTROLLER_PATH_HACK,
  useFactory: (options: ShopifyWebhooksOptions) => {
    Reflect.defineMetadata(
      PATH_METADATA,
      options.path,
      ShopifyWebhooksController
    );
  },
  inject: [SHOPIFY_WEBHOOKS_OPTIONS],
};
