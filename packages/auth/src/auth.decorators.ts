import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import Shopify from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { AUTH_MODE_KEY } from './auth.constants';
import { ShopifyAuthExceptionFilter } from './auth.filter';
import { ShopifyAuthGuard } from './auth.guard';
import { AccessMode } from './auth.interfaces';

export const Shop = createParamDecorator<
  unknown,
  ExecutionContext,
  Promise<string | undefined>
>(async (_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<IncomingMessage>();
  const res = ctx.switchToHttp().getResponse<ServerResponse>();

  const session = await Shopify.Utils.loadCurrentSession(req, res);
  return session?.shop;
});

export const UseShopifyAuth = (accessMode?: AccessMode) =>
  applyDecorators(
    SetMetadata(AUTH_MODE_KEY, accessMode || AccessMode.Online),
    UseGuards(ShopifyAuthGuard),
    UseFilters(ShopifyAuthExceptionFilter)
  );
