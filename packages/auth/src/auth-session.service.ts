import { Injectable } from '@nestjs/common';
import Shopify, { SessionInterface } from '@shopify/shopify-api';

export interface RequestLike {
  headers: Record<string, string | undefined>;
  url: string | undefined;
}

@Injectable()
export class ShopifyAuthSessionService {
  public getShop(req: RequestLike, session: SessionInterface | undefined) {
    if (this.isEmbeddedApp) {
      return session?.shop || this.getShopFromAuthHeader(req);
    }

    const query = this.getQueryFromRequest(req);
    return query['shop'];
  }

  private get isEmbeddedApp() {
    return Shopify.Context.IS_EMBEDDED_APP;
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
        const payload = Shopify.Utils.decodeSessionToken(matches[1]);
        return payload.dest.replace('https://', '');
      } catch (error) {
        // do nothing
      }
    }

    return undefined;
  }
}
