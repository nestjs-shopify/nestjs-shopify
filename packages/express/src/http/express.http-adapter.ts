import { InjectShopify, ShopifyHttpAdapter } from '@nestjs-shopify/core';
import { Injectable } from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import { Request, Response } from 'express';

@Injectable()
export class ShopifyExpressAdapter extends ShopifyHttpAdapter<
  Request,
  Response
> {
  constructor(@InjectShopify() shopifyApi: Shopify) {
    super(shopifyApi);
  }

  protected override setHeader(
    response: Response,
    header: string,
    value: string | string[],
  ): void {
    return void response.setHeader(header, value);
  }

  protected override extractHeaders(
    request: Request,
  ): Record<string, string | string[] | undefined> {
    return request.headers;
  }

  protected override extractQueryParams<Query = Record<string, unknown>>(
    req: Request,
  ): Query {
    return req.query as Query;
  }
}
