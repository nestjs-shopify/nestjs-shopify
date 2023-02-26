import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Session, Shopify } from '@shopify/shopify-api';

@Injectable()
export class ShopifyWebhooksService {
  private readonly logger = new Logger(ShopifyWebhooksService.name);

  constructor(
    @Inject(SHOPIFY_API_CONTEXT) private readonly shopifyApi: Shopify
  ) {}

  async registerWebhooks(session: Session) {
    const responsesByTopic = await this.shopifyApi.webhooks.register({
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
