import { Injectable, Logger } from '@nestjs/common';
import { InjectShopify, ShopifyFactory } from '@rh-nestjs-shopify/core';
import { Session, Shopify } from '@shopify/shopify-api';

@Injectable()
export class ShopifyWebhooksService {
  private readonly logger = new Logger(ShopifyWebhooksService.name);

  constructor(
    @InjectShopify() private readonly shopifyFactory: ShopifyFactory,
  ) {}

  async registerWebhooks(session: Session) {
    const shopifyInstance = this.shopifyFactory.getInstance() as Shopify;
    const responsesByTopic = await shopifyInstance.webhooks.register({
      session,
    });

    Object.keys(responsesByTopic).forEach((topic: string) => {
      responsesByTopic[topic].forEach((response) => {
        if (response.success) {
          this.logger.log(`Registered webhook ${topic} successfully.`);
        } else {
          this.logger.warn(
            `Failed to register webhook ${topic}: ${response['result']}`,
          );
        }
      });
    });
  }
}
