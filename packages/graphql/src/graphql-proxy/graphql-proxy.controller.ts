import {
  AccessMode,
  ShopifySessionRequest,
  UseShopifyAuth,
} from '@nestjs-shopify/auth';
import { ShopifyHttpAdapter } from '@nestjs-shopify/core';
import {
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';

@Controller('graphql')
@UseShopifyAuth(AccessMode.Online)
export class ShopifyGraphqlProxyController {
  constructor(private readonly shopifyHttpAdapter: ShopifyHttpAdapter) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async proxy(
    @Req() req: ShopifySessionRequest<unknown>,
    @Res({ passthrough: true }) res: unknown,
  ) {
    const session = req.shopifySession;
    if (!session) {
      throw new ForbiddenException('No session found');
    }

    return this.shopifyHttpAdapter.graphqlProxy(req, res, session);
  }
}
