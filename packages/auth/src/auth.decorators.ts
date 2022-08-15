import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import Shopify, { SessionInterface } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { AUTH_MODE_KEY } from './auth.constants';
import { ShopifyAuthExceptionFilter } from './auth.filter';
import { ShopifyAuthGuard } from './auth.guard';
import { AccessMode } from './auth.interfaces';

export const UseShopifyAuth = (mode = AccessMode.Online) =>
  applyDecorators(
    SetMetadata(AUTH_MODE_KEY, mode),
    UseGuards(ShopifyAuthGuard),
    UseFilters(ShopifyAuthExceptionFilter)
  );

export const CurrentSession = createParamDecorator<
  unknown,
  ExecutionContext,
  Promise<SessionInterface | undefined>
>((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<IncomingMessage>();
  const res = ctx.switchToHttp().getResponse<ServerResponse>();

  return Shopify.Utils.loadCurrentSession(req, res);
});
