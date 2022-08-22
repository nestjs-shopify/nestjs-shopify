/* eslint-disable @typescript-eslint/ban-types */
import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SHOPIFY_WEBHOOKS_METADATA } from './webhooks.constants';
import { ShopifyWebhookHandlerOptions } from './webhooks.interfaces';

@Injectable()
export class ShopifyWebhooksMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  public isShopifyWebhookHandler(target: Type<unknown> | Function): boolean {
    if (!target) {
      return false;
    }

    return !!this.getShopifyWebhooksHandlerMetadata(target);
  }

  public getShopifyWebhooksHandlerMetadata(
    target: Type<unknown> | Function
  ): ShopifyWebhookHandlerOptions | undefined {
    return this.reflector.get(SHOPIFY_WEBHOOKS_METADATA, target);
  }
}
