import { Controller, Post, Req, Res } from '@nestjs/common';
import Shopify, { SessionInterface } from '@shopify/shopify-api';
import { GraphqlQueryError } from '@shopify/shopify-api/dist/error';
import type { ServerResponse } from 'http';
import { CurrentSession, UseShopifyAuth } from '../auth.decorators';
import { AccessMode } from '../auth.interfaces';

@Controller('graphql')
@UseShopifyAuth(AccessMode.Online)
export class ShopifyGraphqlController {
  @Post()
  async proxy(
    @Req() req: { body: { [key: string]: unknown } },
    @Res() res: ServerResponse,
    @CurrentSession() session: SessionInterface
  ) {
    const client = new Shopify.Clients.Graphql(
      session.shop,
      session.accessToken
    );

    try {
      const response = await client.query({
        data: req.body,
      });
      res
        .writeHead(200, undefined, response.headers.raw())
        .end(JSON.stringify(response.body));
    } catch (error) {
      if (error instanceof GraphqlQueryError) {
        return res
          .writeHead(400, error.message, {
            'Content-Type': 'application/json',
          })
          .end(JSON.stringify(error.response));
      }

      throw error;
    }
  }
}
