import { AccessMode, UseShopifyAuth } from '@nestjs-shopify/auth';
import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import {
  Controller,
  Inject,
  Post,
  RawBodyRequest,
  Req,
  Res,
} from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';

@Controller('graphql')
@UseShopifyAuth(AccessMode.Online)
export class ShopifyGraphqlProxyController {
  constructor(
    @Inject(SHOPIFY_API_CONTEXT) private readonly shopifyApi: Shopify
  ) {}

  @Post()
  async proxy(
    @Req() req: RawBodyRequest<IncomingMessage>,
    @Res() res: ServerResponse
  ) {
    const { body, headers } = await this.shopifyApi.clients.graphqlProxy({
      body: req.rawBody?.toString() || '',
      rawRequest: req,
      rawResponse: res,
    });

    res.writeHead(200, headers);
    res.end(body);
  }
}
