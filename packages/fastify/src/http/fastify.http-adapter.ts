import { InjectShopify, ShopifyHttpAdapter } from '@nestjs-shopify/core';
import { Injectable } from '@nestjs/common';
import { Shopify } from '@shopify/shopify-api';
import { FastifyRequest, FastifyReply } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';

@Injectable()
export class ShopifyFastifyAdapter extends ShopifyHttpAdapter<
  FastifyRequest,
  FastifyReply
> {
  constructor(@InjectShopify() shopifyApi: Shopify) {
    super(shopifyApi);
  }

  public override getRawRequest(req: FastifyRequest): IncomingMessage {
    return req.raw;
  }

  public override getRawResponse(res: FastifyReply): ServerResponse {
    return res.raw;
  }

  protected override setHeader(
    response: FastifyReply,
    header: string,
    value: string | string[],
  ): void {
    return void response.header(header, value);
  }

  protected override extractHeaders(
    request: FastifyRequest,
  ): Record<string, string | string[] | undefined> {
    return request.headers;
  }

  protected override extractQueryParams<Query = Record<string, unknown>>(
    request: FastifyRequest,
  ): Query {
    return request.query as Query;
  }
}
