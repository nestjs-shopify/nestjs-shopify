import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectShopify } from '../core.decorators';
import { Shopify } from '@shopify/shopify-api';

interface RequestLike {
  query: Record<string, string>;
}

interface ResponseLike {
  setHeader: (key: string, value: string) => void;
}

@Injectable()
export class ShopifyCspMiddleware implements NestMiddleware {
  constructor(@InjectShopify() private readonly shopifyApi: Shopify) {}

  public use(req: RequestLike, res: ResponseLike, next: () => void) {
    const { shop } = req.query;
    const sanitizedShop = this.shopifyApi.utils.sanitizeShop(shop);

    if (this.shopifyApi.config.isEmbeddedApp && sanitizedShop) {
      res.setHeader(
        'Content-Security-Policy',
        `frame-ancestors https://${encodeURIComponent(
          sanitizedShop
        )} https://admin.shopify.com;`
      );
    } else {
      res.setHeader('Content-Security-Policy', 'frame-ancestors none');
    }

    next();
  }
}
