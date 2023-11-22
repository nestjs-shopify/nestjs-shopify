import { Controller, ForbiddenException, Post, Req, Res } from '@nestjs/common';
import {
  AccessMode,
  ShopifySessionRequest,
  UseShopifyAuth,
} from '@rh-nestjs-shopify/auth';
import { InjectShopify, ShopifyFactory } from '@rh-nestjs-shopify/core';
import { Shopify } from '@shopify/shopify-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, ServerResponse } from 'node:http';

@Controller('graphql')
@UseShopifyAuth(AccessMode.Online)
export class ShopifyGraphqlProxyController {
  constructor(
    @InjectShopify() private readonly shopifyFactory: ShopifyFactory,
  ) {}

  @Post()
  async proxy(
    @Req()
    req: ShopifySessionRequest<IncomingMessage | FastifyRequest> & {
      body: string;
    },
    @Res() response: ServerResponse | FastifyReply,
  ) {
    const res = response instanceof ServerResponse ? response : response.raw;

    const session = req.shopifySession;
    if (!session) {
      throw new ForbiddenException('No session found');
    }

    const { body, headers } = await (
      this.shopifyFactory.getInstance() as Shopify
    ).clients.graphqlProxy({
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
