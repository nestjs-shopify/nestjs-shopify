import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import Shopify, { SessionInterface } from '@shopify/shopify-api';
import { GraphqlQueryError } from '@shopify/shopify-api/dist/error';
import type { IncomingMessage, ServerResponse } from 'http';
import { CurrentSession, UseShopifyAuth } from '../auth.decorators';
import { AccessMode } from '../auth.interfaces';

@Controller('graphql')
@UseShopifyAuth(AccessMode.Online)
export class ShopifyGraphqlController {
  @Post()
  async proxy(
    @Req() req: RawBodyRequest<IncomingMessage>,
    @Res() res: ServerResponse,
    @CurrentSession() session: SessionInterface
  ) {
    if (!req.rawBody) {
      throw new Error('Nest options `rawBody` is not enabled.');
    }

    const options = {
      data: req.rawBody.toString(),
    };
    const client = new Shopify.Clients.Graphql(
      session.shop,
      session.accessToken
    );

    try {
      const response = await client.query(options);
      res.writeHead(200).end(JSON.stringify(response.body));
    } catch (error) {
      if (error instanceof GraphqlQueryError) {
        return res
          .writeHead(400)
          .setHeader('Content-Type', 'application/json')
          .end(JSON.stringify(error.response));
      }

      throw error;
    }
  }
}
