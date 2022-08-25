import {
  BadRequestException,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import type { IncomingMessage } from 'http';
import Shopify, { ShopifyHeader } from '@shopify/shopify-api';
import { createHmac, timingSafeEqual } from 'crypto';
import { SHOPIFY_WEBHOOKS_DEFAULT_PATH } from './webhooks.constants';

@Controller(SHOPIFY_WEBHOOKS_DEFAULT_PATH)
export class ShopifyWebhooksController {
  private readonly logger = new Logger('Webhook');

  @Post()
  @HttpCode(200)
  async handle(@Req() req: RawBodyRequest<IncomingMessage>) {
    const { rawBody } = req;
    if (!rawBody) {
      throw new InternalServerErrorException(
        'Enable `rawBody` option when creating Nest application.'
      );
    }
    const { domain, hmac, topic } = this.getHeaders(req);

    this.validateHmac(rawBody, hmac as string);

    const graphqlTopic = (topic as string).toUpperCase().replace(/\//g, '_');
    const webhookEntry = Shopify.Webhooks.Registry.getHandler(graphqlTopic);

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

  private validateHmac(rawBody: Buffer, hmac: string) {
    const generatedHash = createHmac('sha256', Shopify.Context.API_SECRET_KEY)
      .update(rawBody)
      .digest('base64');

    const generatedHashBuffer = Buffer.from(generatedHash);
    const hmacBuffer = Buffer.from(hmac);

    if (generatedHashBuffer.length !== hmacBuffer.length) {
      throw new UnauthorizedException('Webhook HMAC validation failed.');
    }

    if (!timingSafeEqual(generatedHashBuffer, hmacBuffer)) {
      throw new UnauthorizedException('Webhook HMAC validation failed.');
    }
  }

  private getHeaders(req: IncomingMessage) {
    let hmac: string | string[] | undefined;
    let topic: string | string[] | undefined;
    let domain: string | string[] | undefined;
    Object.entries(req.headers).map(([header, value]) => {
      switch (header.toLowerCase()) {
        case ShopifyHeader.Hmac.toLowerCase():
          hmac = value;
          break;
        case ShopifyHeader.Topic.toLowerCase():
          topic = value;
          break;
        case ShopifyHeader.Domain.toLowerCase():
          domain = value;
          break;
      }
    });

    const missingHeaders = [];
    if (!hmac) {
      missingHeaders.push(ShopifyHeader.Hmac);
    }
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
      hmac,
      topic,
      domain,
    };
  }
}
