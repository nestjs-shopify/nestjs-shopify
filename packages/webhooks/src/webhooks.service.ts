import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import { ShortenedRegisterParams } from '@shopify/shopify-api/dist/webhooks/types';

@Injectable()
export class ShopifyWebhooksService {
  private readonly logger = new Logger(ShopifyWebhooksService.name);

  constructor(
    @Inject(SHOPIFY_API_CONTEXT) private readonly shopifyApi: Shopify
  ) {}

  async registerWebhooks(options: ShortenedRegisterParams) {
    const { accessToken, shop, deliveryMethod } = options;

    const response = await this.shopifyApi.webhooks.registerAll({
      accessToken,
      shop,
      deliveryMethod,
    });

    Object.keys(response).forEach((topic: string) => {
      if (response[topic].success) {
        this.logger.log(`Registered webhook ${topic} successfully.`);
      } else {
        this.logger.warn(
          `Failed to register webhook ${topic}: ${response['result']}`
        );
      }
    });
  }
}
