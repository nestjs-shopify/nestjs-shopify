import { Controller, Post, Req, Res } from '@nestjs/common';
import Shopify from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { ShopifyOnlineAuth } from './online-auth.decorators';

@Controller('graphql')
@ShopifyOnlineAuth()
export class ShopifyGraphqlController {
  @Post()
  async proxy(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    await Shopify.Utils.graphqlProxy(req, res);
  }
}
