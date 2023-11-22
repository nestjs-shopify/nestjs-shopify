import { Shopify, shopifyApi } from '@shopify/shopify-api';
import { ShopifyCoreOptions } from './core.interfaces';
import { trace } from 'console';

export class ShopifyFactory {
  private instance = new Map<string, Shopify>();

  constructor(options: ShopifyCoreOptions) {
    const { multiScopes, ...option } = options;
    if (multiScopes && multiScopes.length > 0) {
      for (const scopes of multiScopes || []) {
        this.instance.set(
          scopes.key,
          shopifyApi({ ...option, scopes: scopes.scopes }),
        );
      }
    } else {
      this.instance.set(
        'DEFAULT',
        shopifyApi({ ...option, scopes: option.scopes }),
      );
    }
  }

  getInstances() {
    return this.instance;
  }

  getInstance(key = 'DEFAULT') {
    console.log('[getInstance]', key);

    if (this.instance.has(key)) {
      return this.instance.get(key);
    } else {
      trace();
      throw new Error('NOT FOUND INSTANCE');
    }
  }

  setInstance(key: string, options: ShopifyCoreOptions) {
    const { multiScopes, ...option } = options;
    const shopify = shopifyApi({ ...option });
    this.instance.set(key, shopify);
    return shopify;
  }
}
