import {
  AccessMode,
  ShopifySessionRequest,
  UseShopifyAuth,
} from '@nestjs-shopify/auth';
import { InjectShopify } from '@nestjs-shopify/core';
import { Controller, ForbiddenException, Post, Req, Res } from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';

@Controller('graphql')
@UseShopifyAuth(AccessMode.Online)
export class ShopifyGraphqlProxyController {
  constructor(@InjectShopify() private readonly shopifyApi: Shopify) {}

  @Post()
  async proxy(
    @Req() req: ShopifySessionRequest<IncomingMessage> & { body: string },
    @Res() res: ServerResponse
  ) {
    const session = req.shopifySession;
    if (!session) {
      throw new ForbiddenException('No session found');
    }

    const { body, headers } = await this.shopifyApi.clients.graphqlProxy({
      rawBody: req.body,
      session,
    });

    // NOTE: the Shopify GraphQL client returns gzip encoding header. Which we do not
    // use. Remove it otherwise the apps cannot parse the JSON response.
    delete headers['Content-Encoding'];

    res.writeHead(200, headers);
    res.end(JSON.stringify(body));
  }
}
