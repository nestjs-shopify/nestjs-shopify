import { Controller, Post, Req, Res } from '@nestjs/common';
import Shopify from '@shopify/shopify-api';

@Controller('shopify/webhooks')
export class ShopifyWebhooksController {
  @Post()
  async handle(@Req() req: unknown, @Res() res: unknown) {
    await Shopify.Webhooks.Registry.process(req, res);
  }
}
