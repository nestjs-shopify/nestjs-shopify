import {
  ShopifyWebhookHandler,
  WebhookHandler,
} from '@rh-nestjs-shopify/webhooks';
import { Inject, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { IncomingMessage } from 'http';

@WebhookHandler({ topic: 'PRODUCTS_UPDATE', scope: Scope.REQUEST })
export class ProductsUpdateHandler extends ShopifyWebhookHandler {
  constructor(@Inject(REQUEST) private readonly req: IncomingMessage) {
    super();
  }

  async handle(_shop: string, _data: unknown): Promise<void> {
    // process the data
  }
}
