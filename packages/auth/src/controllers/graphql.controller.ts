import { Controller, Post, Req, Res } from '@nestjs/common';
import Shopify from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { UseShopifyAuth } from '../auth.decorators';

@Controller('graphql')
@UseShopifyAuth()
export class ShopifyGraphqlController {
  @Post()
  async proxy(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    await Shopify.Utils.graphqlProxy(req, res);
  }
}
