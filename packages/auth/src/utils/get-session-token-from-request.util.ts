import { ExecutionContext } from '@nestjs/common';
import { ShopifyHttpAdapter } from '@nestjs-shopify/core';

export const getSessionTokenFromRequest = (
  ctx: ExecutionContext,
  shopifyHttpAdapter: ShopifyHttpAdapter,
): string | undefined => {
  return (
    getSessionTokenFromAuthHeader(ctx, shopifyHttpAdapter) ||
    getSessionTokenFromQuery(ctx, shopifyHttpAdapter)
  );
};

function getSessionTokenFromAuthHeader(
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
    return matches[1];
  }

  return;
}

function getSessionTokenFromQuery(
  ctx: ExecutionContext,
  shopifyHttpAdapter: ShopifyHttpAdapter,
): string | undefined {
  return shopifyHttpAdapter.getQueryParamFromExecutionContext(
    ctx,
    'id_token',
  ) as string;
}
