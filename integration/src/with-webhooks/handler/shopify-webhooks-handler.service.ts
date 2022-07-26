import { ShopifyWebhooksHandler } from '@nestjs-shopify/webhooks';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ShopifyWebhooksHandlerService implements ShopifyWebhooksHandler {
  private readonly logger = new Logger(ShopifyWebhooksHandlerService.name);

  async process(topic: string, shop: string, body: string): Promise<void> {
    this.logger.log(`${topic} ${shop} ${body}`);
  }
}
