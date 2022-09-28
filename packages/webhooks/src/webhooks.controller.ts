import {
  BadRequestException,
  Controller,
  HttpCode,
  Inject,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import {
  ShopifyHmac,
  ShopifyHmacType,
  SHOPIFY_API_CONTEXT,
} from '@nestjs-shopify/core';
import { Shopify, ShopifyHeader } from '@shopify/shopify-api';
import type { IncomingMessage } from 'http';
import { SHOPIFY_WEBHOOKS_DEFAULT_PATH } from './webhooks.constants';

@Controller(SHOPIFY_WEBHOOKS_DEFAULT_PATH)
export class ShopifyWebhooksController {
  private readonly logger = new Logger('Webhook');

  constructor(
    @Inject(SHOPIFY_API_CONTEXT) private readonly shopifyApi: Shopify
  ) {}

  @Post()
  @HttpCode(200)
  @ShopifyHmac(ShopifyHmacType.Header)
  async handle(@Req() req: RawBodyRequest<IncomingMessage>) {
    const { rawBody } = req;
    if (!rawBody) {
      throw new InternalServerErrorException(
        'Enable `rawBody` option when creating Nest application.'
      );
    }

    const { domain, topic } = this.getHeaders(req);
    const graphqlTopic = (topic as string).toUpperCase().replace(/\//g, '_');
    const webhookEntry = this.shopifyApi.webhooks.getHandler({
      topic: graphqlTopic,
    });

    if (webhookEntry) {
      this.logger.log(`Received webhook "${graphqlTopic}"`);

      await webhookEntry.webhookHandler(
        graphqlTopic,
        domain as string,
        rawBody.toString()
      );
    } else {
      throw new NotFoundException(
        `No webhook is registered for topic ${topic}`
      );
    }
  }

  private getHeaders(req: IncomingMessage) {
    let topic: string | string[] | undefined;
    let domain: string | string[] | undefined;
    Object.entries(req.headers).map(([header, value]) => {
      switch (header.toLowerCase()) {
        case ShopifyHeader.Topic.toLowerCase():
          topic = value;
          break;
        case ShopifyHeader.Domain.toLowerCase():
          domain = value;
          break;
      }
    });

    const missingHeaders = [];
    if (!topic) {
      missingHeaders.push(ShopifyHeader.Topic);
    }
    if (!domain) {
      missingHeaders.push(ShopifyHeader.Domain);
    }

    if (missingHeaders.length) {
      throw new BadRequestException(
        `Missing one or more of the required HTTP headers to process webhooks: [${missingHeaders.join(
          ', '
        )}]`
      );
    }

    return {
      topic,
      domain,
    };
  }
}
