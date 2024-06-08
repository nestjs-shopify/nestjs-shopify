import {
  AccessMode,
  ShopifyAuthTokenExchangeAfterHandler,
  ShopifyAuthTokenExchangeAfterHandlerParams,
  ShopifyTokenExchangeService,
} from '@nestjs-shopify/auth';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyAfterAuthHandler
  implements ShopifyAuthTokenExchangeAfterHandler
{
  constructor(
    private readonly tokenExchangeService: ShopifyTokenExchangeService,
  ) {}
  async afterAuth({
    session,
    sessionToken,
  }: ShopifyAuthTokenExchangeAfterHandlerParams) {
    if (session.isOnline) {
      try {
        const offlineSession = await this.tokenExchangeService.exchangeToken(
          sessionToken,
          session.shop,
          AccessMode.Offline,
        );
        console.log('Offline session:', offlineSession);
      } catch (e) {
        /* empty */
      }
    }
  }
}
