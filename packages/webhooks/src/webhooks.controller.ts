import {
  BadRequestException,
  Controller,
  HttpCode,
  InternalServerErrorException,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import type { IncomingMessage } from 'http';
import Shopify, { ShopifyHeader } from '@shopify/shopify-api';
import { createHmac, timingSafeEqual } from 'crypto';

@Controller('shopify/webhooks')
export class ShopifyWebhooksController {
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
      await webhookEntry.webhookHandler(
        graphqlTopic,
        domain as string,
        rawBody.toString()
      );
    } else {
      throw new BadRequestException(
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
      throw new BadRequestException('Webhook HMAC validation failed.');
    }

    if (!timingSafeEqual(generatedHashBuffer, hmacBuffer)) {
      throw new BadRequestException('Webhook HMAC validation failed.');
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
