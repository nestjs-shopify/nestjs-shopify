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
    const response = await this.shopifyApi.webhooks.register({
      session,
    });

    Object.keys(response).forEach((topic: string) => {
      response[topic].forEach((result) => {
        if (result.success) {
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
