import { ExecutionContext, Logger } from '@nestjs/common';
import { Session } from '@shopify/shopify-api';
import { decodeSessionToken } from './decode-session-token.util';
import { ShopifyHttpAdapter } from '@nestjs-shopify/core';
import { getSessionTokenFromRequest } from './get-session-token-from-request.util';

export const getShopFromRequest = (
  ctx: ExecutionContext,
  shopifyHttpAdapter: ShopifyHttpAdapter,
  session: Session | undefined,
): string | undefined => {
  return (
    session?.shop ||
    getShopFromSessionToken(ctx, shopifyHttpAdapter) ||
    getShopFromQuery(ctx, shopifyHttpAdapter)
  );
};

function getShopFromQuery(
  ctx: ExecutionContext,
  shopifyHttpAdapter: ShopifyHttpAdapter,
): string | undefined {
  return shopifyHttpAdapter.getQueryParamFromExecutionContext(
    ctx,
    'shop',
  ) as string;
}

function getShopFromSessionToken(
  ctx: ExecutionContext,
  shopifyHttpAdapter: ShopifyHttpAdapter,
): string | undefined {
  const token = getSessionTokenFromRequest(ctx, shopifyHttpAdapter);
  if (token !== undefined) {
    try {
      const payload = decodeSessionToken(token);
      const dest = new URL(payload.dest);
      const shop = dest.hostname;
      return shop;
    } catch (error) {
      Logger.error(error);
      // do nothing
    }
  }
  return;
}
