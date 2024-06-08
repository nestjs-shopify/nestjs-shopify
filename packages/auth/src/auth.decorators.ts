import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Session } from '@shopify/shopify-api';
import { ACCESS_MODE_KEY } from './auth.constants';
import { ShopifyAuthExceptionFilter } from './auth.filter';
import { ShopifyAuthGuard } from './auth.guard';
import { AccessMode, ShopifySessionRequest } from './auth.interfaces';
import { ShopifyAuthTokenExchangeExceptionFilter } from './auth.token-exchange.filter';

export const UseShopifyAuth = (mode = AccessMode.Online) =>
  applyDecorators(
    SetMetadata(ACCESS_MODE_KEY, mode),
    UseGuards(ShopifyAuthGuard),
    UseFilters(
      ShopifyAuthExceptionFilter,
      ShopifyAuthTokenExchangeExceptionFilter,
    ),
  );

export const CurrentSession = createParamDecorator<
  unknown,
  ExecutionContext,
  Session | undefined
>((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<ShopifySessionRequest<unknown>>();

  return req.shopifySession;
});
