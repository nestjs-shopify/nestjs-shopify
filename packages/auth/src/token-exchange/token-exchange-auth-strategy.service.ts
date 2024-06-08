import {
  InjectShopifySessionStorage,
  SessionStorage,
  ShopifyHttpAdapter,
} from '@nestjs-shopify/core';
import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AccessMode,
  ShopifyAuthModuleTokenExchangeOptions,
  ShopifyAuthStrategyService,
} from '../auth.interfaces';
import { getSessionTokenFromRequest } from '../utils/get-session-token-from-request.util';
import { TOKEN_EXCHANGE_OPTIONS_TOKEN } from '../auth.constants';
import { ShopifyTokenExchangeService } from './token-exchange.service';

@Injectable()
export class ShopifyTokenExchangeAuthStrategyService
  implements ShopifyAuthStrategyService
{
  constructor(
    @Inject(TOKEN_EXCHANGE_OPTIONS_TOKEN)
    private readonly options: ShopifyAuthModuleTokenExchangeOptions,
    private readonly tokenExchangeService: ShopifyTokenExchangeService,
    private readonly shopifyHttpAdapter: ShopifyHttpAdapter,
    @InjectShopifySessionStorage()
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
        req: this.shopifyHttpAdapter.getRawRequest(
          ctx.switchToHttp().getRequest(),
        ),
        res: this.shopifyHttpAdapter.getRawResponse(
          ctx.switchToHttp().getResponse(),
        ),
        session: newSession,
        sessionToken,
      });
    }
    return newSession;
  }
}
