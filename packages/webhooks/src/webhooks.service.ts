import { InjectShopify } from '@rh-nestjs-shopify/core';
import { Injectable, Logger } from '@nestjs/common';
import { Session, Shopify } from '@shopify/shopify-api';
import { ShopifyFactory } from '../../core/src/shopify-factory';

@Injectable()
export class ShopifyWebhooksService {
  private readonly logger = new Logger(ShopifyWebhooksService.name);

  constructor(
    @InjectShopify() private readonly shopifyFactory: ShopifyFactory
  ) {}

  async registerWebhooks(session: Session, scope?: string) {
    const shopifyInstance = scope
      ? (this.shopifyFactory.getInstance(scope) as Shopify)
      : (this.shopifyFactory.getInstance() as Shopify);
    const responsesByTopic = await shopifyInstance.webhooks.register({
      session,
    });

    Object.keys(responsesByTopic).forEach((topic: string) => {
      responsesByTopic[topic].forEach((response) => {
        if (response.success) {
          this.logger.log(`Registered webhook ${topic} successfully.`);
        } else {
          this.logger.warn(
            `Failed to register webhook ${topic}: ${response['result']}`
          );
        }
      });
    });
  }
}
