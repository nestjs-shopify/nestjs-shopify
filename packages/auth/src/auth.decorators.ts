import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Session } from '@shopify/shopify-api';
import type { IncomingMessage } from 'http';
import { AUTH_MODE_KEY } from './auth.constants';
import { ShopifyAuthExceptionFilter } from './auth.filter';
import { ShopifyAuthGuard } from './auth.guard';
import { AccessMode, ShopifySessionRequest } from './auth.interfaces';
import { ShopifyCoreRequestWrapper } from '@nestjs-shopify/core';

export const UseShopifyAuth = (mode = AccessMode.Online) =>
  applyDecorators(
    SetMetadata(AUTH_MODE_KEY, mode),
    UseGuards(ShopifyAuthGuard),
    UseFilters(ShopifyAuthExceptionFilter)
  );

export const CurrentSession = createParamDecorator<
  unknown,
  ExecutionContext,
  Session | undefined
>((_data: unknown, ctx: ExecutionContext) => {
  const abstractReq = ctx.switchToHttp().getRequest();
  const req = ShopifyCoreRequestWrapper.getRawRequest(
    abstractReq
  ) as ShopifySessionRequest<IncomingMessage>;

  return req.shopifySession;
});
