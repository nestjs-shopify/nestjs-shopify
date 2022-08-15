import { Controller, Post, Req, Res } from '@nestjs/common';
import Shopify from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { UseShopifyAuth } from '../auth.decorators';
import { AccessMode } from '../auth.interfaces';

@Controller('graphql')
@UseShopifyAuth(AccessMode.Online)
export class ShopifyGraphqlController {
  @Post()
  async proxy(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    await Shopify.Utils.graphqlProxy(req, res);
  }
}
