import { Logger } from '@nestjs/common';
import { Shopify, shopifyApi } from '@shopify/shopify-api';

import { ShopifyCoreOptions } from './core.interfaces';

const logger = new Logger('ShopifyFactory');
export class ShopifyFactory {
  private instances = new Map<string, Shopify>();

  constructor(options: ShopifyCoreOptions) {
    const { multiScopes, ...option } = options;
    if (multiScopes && multiScopes.length > 0) {
      for (const scopes of multiScopes || []) {
        this.instances.set(
          scopes.key,
          shopifyApi({ ...option, scopes: scopes.scopes }),
        );
      }
    } else {
      this.instances.set(
        'DEFAULT',
        shopifyApi({ ...option, scopes: option.scopes }),
      );
    }
  }

  getInstances() {
    return this.instances;
  }

  getInstance(key = 'DEFAULT') {
    logger.log(`[getInstance] : ${key}`);

    if (this.instances.has(key)) {
      return this.instances.get(key);
    } else {
      throw new Error('NOT_FOUND_INSTANCE');
    }
  }

  setInstance(key: string, options: ShopifyCoreOptions) {
    const { multiScopes, ...option } = options;
    const shopify = shopifyApi({ ...option });
    this.instances.set(key, shopify);
    return shopify;
  }
}
