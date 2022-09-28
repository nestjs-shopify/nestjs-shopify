import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { SessionInterface, Shopify } from '@shopify/shopify-api';
import { decodeSessionToken } from './utils/decode-session-token.util';

export interface RequestLike {
  headers: Record<string, string | undefined>;
  url: string | undefined;
}

@Injectable()
export class ShopifyAuthSessionService {
  private readonly logger = new Logger('ShopifyAuth');

  constructor(
    @Inject(SHOPIFY_API_CONTEXT)
    private readonly shopifyApi: Shopify
  ) {}

  public isValid(session: SessionInterface): boolean {
    const isSessionExpired =
      !session.expires || new Date(session.expires) < new Date();

    const scopesEqual = this.shopifyApi.config.scopes.equals(session.scope);

    return scopesEqual && !!session.accessToken && !isSessionExpired;
  }

  public getShop(req: RequestLike, session?: SessionInterface | undefined) {
    if (this.isEmbeddedApp) {
      return session?.shop || this.getShopFromAuthHeader(req);
    }

    const query = this.getQueryFromRequest(req);
    return query['shop'];
  }

  private get isEmbeddedApp() {
    return this.shopifyApi.config.isEmbeddedApp;
  }

  private getQueryFromRequest(req: RequestLike) {
    return Object.fromEntries(
      new URLSearchParams(req.url?.split('?')?.[1] || '').entries()
    );
  }

  private getShopFromAuthHeader(req: RequestLike) {
    let authHeader: string | undefined;
    if (this.isEmbeddedApp) {
      authHeader = req.headers['authorization'];
    }

    const matches = authHeader?.match(/Bearer (.*)/);
    if (matches) {
      try {
        const payload = decodeSessionToken(matches[1]);
        return payload.dest.replace('https://', '');
      } catch (error) {
        this.logger.error(error);
        // do nothing
      }
    }

    return undefined;
  }
}
