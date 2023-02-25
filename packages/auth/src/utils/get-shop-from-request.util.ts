import { Logger } from '@nestjs/common';
import { Session } from '@shopify/shopify-api';
import { decodeSessionToken } from './decode-session-token.util';

export interface RequestLike {
  headers: Record<string, string | undefined>;
  url: string | undefined;
}

export const getShopFromRequest = (
  req: RequestLike,
  session: Session | undefined
): string | undefined =>
  session?.shop || getShopFromAuthHeader(req) || getShopFromQuery(req);

function getShopFromQuery(req: RequestLike): string | undefined {
  const query = Object.fromEntries(
    new URLSearchParams(req.url?.split('?')?.[1] || '').entries()
  );

  return query['shop'];
}

function getShopFromAuthHeader(req: RequestLike): string | undefined {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return;
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
