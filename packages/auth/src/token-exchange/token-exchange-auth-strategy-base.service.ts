import { SessionStorage, ShopifyHttpAdapter } from '@nestjs-shopify/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import {
  AccessMode,
  ShopifyAuthModuleTokenExchangeOptions,
  ShopifyAuthStrategyService,
} from '../auth.interfaces';
import { getSessionTokenFromRequest } from '../utils/get-session-token-from-request.util';
import { ShopifyTokenExchangeService } from './token-exchange.service';

export class ShopifyTokenExchangeAuthStrategyBaseService
  implements ShopifyAuthStrategyService
{
  constructor(
    private readonly options: ShopifyAuthModuleTokenExchangeOptions,
    private readonly tokenExchangeService: ShopifyTokenExchangeService,
    private readonly shopifyHttpAdapter: ShopifyHttpAdapter,
    private readonly sessionStorage: SessionStorage,
  ) {}

  public async authenticate(
    ctx: ExecutionContext,
    shop: string,
    accessMode: AccessMode,
  ) {
    const sessionToken = getSessionTokenFromRequest(
      ctx,
      this.shopifyHttpAdapter,
    );
    if (sessionToken === undefined) {
      throw new UnauthorizedException();
    }

    const newSession = await this.tokenExchangeService.exchangeToken(
      sessionToken,
      shop,
      accessMode,
    );
    await this.sessionStorage.storeSession(newSession);

    if (this.options.afterAuthHandler) {
      await this.options.afterAuthHandler.afterAuth({
        session: newSession,
        sessionToken,
      });
    }
    return newSession;
  }
}
