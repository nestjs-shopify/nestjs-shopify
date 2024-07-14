import {
  AccessMode,
  ShopifyTokenExchangeAuthAfterHandler,
  ShopifyTokenExchangeAuthAfterHandlerParams,
  ShopifyTokenExchangeService,
} from '@nestjs-shopify/auth';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MyAfterAuthHandler
  implements ShopifyTokenExchangeAuthAfterHandler
{
  constructor(
    private readonly tokenExchangeService: ShopifyTokenExchangeService,
  ) {}
  async afterAuth({
    session,
    sessionToken,
  }: ShopifyTokenExchangeAuthAfterHandlerParams) {
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
