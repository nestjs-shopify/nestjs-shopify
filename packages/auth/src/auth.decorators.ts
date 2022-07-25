import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import Shopify from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';

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
