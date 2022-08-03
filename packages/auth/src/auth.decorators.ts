import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import Shopify, { SessionInterface } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';

export const CurrentSession = createParamDecorator<
  unknown,
  ExecutionContext,
  Promise<SessionInterface | undefined>
>((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest<IncomingMessage>();
  const res = ctx.switchToHttp().getResponse<ServerResponse>();

  return Shopify.Utils.loadCurrentSession(req, res);
});
