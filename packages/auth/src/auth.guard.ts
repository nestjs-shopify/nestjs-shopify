import {
  InjectShopify,
  InjectShopifySessionStorage,
  SessionStorage,
  ShopifyHttpAdapter,
} from '@nestjs-shopify/core';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InvalidSession, Session, Shopify } from '@shopify/shopify-api';
import { ACCESS_MODE_KEY, AUTH_STRATEGY_SERVICE_TOKEN } from './auth.constants';
import {
  AccessMode,
  ShopifyAuthStrategyService,
  ShopifySessionRequest,
} from './auth.interfaces';
import { getShopFromRequest } from './utils/get-shop-from-request.util';

@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  private readonly logger = new Logger(ShopifyAuthGuard.name);

  constructor(
    @InjectShopify()
    private readonly shopifyApi: Shopify,
    @InjectShopifySessionStorage()
    private readonly sessionStorage: SessionStorage,
    private readonly reflector: Reflector,
    private readonly shopifyHttpAdapter: ShopifyHttpAdapter,
    @Inject(AUTH_STRATEGY_SERVICE_TOKEN)
    private readonly authStrategyService: ShopifyAuthStrategyService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { accessMode, session } = await this.getSessionDataFromContext(ctx);
    if (session && session.isActive(this.shopifyApi.config.scopes)) {
      // We assign the session to the request for further usage in
      // our controllers/decorators
      this.assignSessionToRequest(ctx, session);

      return true;
    }

    const shop = getShopFromRequest(ctx, this.shopifyHttpAdapter, session);

    if (shop) {
      const newSession = await this.authStrategyService.authenticate(
        ctx,
        shop,
        accessMode,
      );

      if (newSession) {
        this.assignSessionToRequest(ctx, newSession);
        return true;
      }
    }

    return false;
  }

  private assignSessionToRequest(
    ctx: ExecutionContext,
    session: Session | undefined,
  ) {
    const req = ctx.switchToHttp().getRequest<ShopifySessionRequest<unknown>>();
    req.shopifySession = session;
  }

  private async getSessionDataFromContext(ctx: ExecutionContext) {
    const accessMode = this.getAccessModeFromContext(ctx);

    const isOnline = accessMode === AccessMode.Online;
    let session: Session | undefined;

    try {
      const sessionId = await this.shopifyHttpAdapter.getCurrentId(
        ctx,
        isOnline,
      );

      if (!sessionId) {
        throw new InvalidSession('No session found');
      }

      session = await this.sessionStorage.loadSession(sessionId);
    } catch (err) {
      this.logger.error(err);
      session = undefined;
    }

    return {
      accessMode,
      session,
    };
  }

  private getAccessModeFromContext(ctx: ExecutionContext) {
    return this.reflector.getAllAndOverride<AccessMode>(ACCESS_MODE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  }
}
