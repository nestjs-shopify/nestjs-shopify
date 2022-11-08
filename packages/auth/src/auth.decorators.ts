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
  const req = ctx
    .switchToHttp()
    .getRequest<ShopifySessionRequest<IncomingMessage>>();

  return req.shopifySession;
});
