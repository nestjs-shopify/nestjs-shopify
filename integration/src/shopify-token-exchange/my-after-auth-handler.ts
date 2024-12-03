import {
  AccessMode,
  ShopifyTokenExchangeAuthAfterHandler,
  ShopifyTokenExchangeAuthAfterHandlerParams,
  ShopifyTokenExchangeService,
} from '@nestjs-shopify/auth';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyAfterAuthHandler
  implements ShopifyTokenExchangeAuthAfterHandler
{
  private readonly logger = new Logger(MyAfterAuthHandler.name);

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
      } catch (error) {
        this.logger.error(error);
      }
    }
  }
}
