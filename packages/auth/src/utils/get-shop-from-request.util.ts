import { ExecutionContext, Logger } from '@nestjs/common';
import { Session } from '@shopify/shopify-api';
import { decodeSessionToken } from './decode-session-token.util';
import { ShopifyHttpAdapter } from '@nestjs-shopify/core';

export const getShopFromRequest = (
  ctx: ExecutionContext,
  shopifyHttpAdapter: ShopifyHttpAdapter,
  session: Session | undefined,
): string | undefined => {
  return (
    session?.shop ||
    getShopFromAuthHeader(ctx, shopifyHttpAdapter) ||
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

function getShopFromAuthHeader(
  ctx: ExecutionContext,
  shopifyHttpAdapter: ShopifyHttpAdapter,
): string | undefined {
  let authHeader = shopifyHttpAdapter.getHeaderFromExecutionContext(
    ctx,
    'authorization',
  );
  if (!authHeader) {
    return;
  }

  if (Array.isArray(authHeader)) {
    authHeader = authHeader[0];
  }

  const matches = authHeader?.match(/Bearer (.*)/);
  if (matches) {
    try {
      const payload = decodeSessionToken(matches[1]);
      return payload.dest.replace('https://', '');
    } catch (error) {
      Logger.error(error);
      // do nothing
    }
  }

  return;
}
