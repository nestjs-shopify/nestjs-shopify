import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionInterface, Shopify } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { RequestLike, ShopifyAuthSessionService } from './auth-session.service';
import { AUTH_MODE_KEY } from './auth.constants';
import { ShopifyAuthException } from './auth.errors';
import { AccessMode, ShopifySessionRequest } from './auth.interfaces';

@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  private readonly logger = new Logger(ShopifyAuthGuard.name);

  constructor(
    @Inject(SHOPIFY_API_CONTEXT)
    private readonly shopifyApi: Shopify,
    private readonly reflector: Reflector,
    private readonly authSessionService: ShopifyAuthSessionService
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { accessMode, session } = await this.getSessionDataFromContext(ctx);

    if (session && this.authSessionService.isValid(session)) {
      // We assign the session to the request for further usage in
      // our controllers/decorators
      this.assignSessionToRequest(ctx, session);

      return true;
    }

    const req = ctx.switchToHttp().getRequest<IncomingMessage>();
    const shop = this.authSessionService.getShop(req as RequestLike, session);

    if (shop) {
      throw new ShopifyAuthException(
        'Reauthorization Required',
        shop,
        accessMode
      );
    }

    return false;
  }

  private assignSessionToRequest(
    ctx: ExecutionContext,
    session: SessionInterface | undefined
  ) {
    const req = ctx
      .switchToHttp()
      .getRequest<ShopifySessionRequest<IncomingMessage>>();
    req.shopifySession = session;
  }

  private async getSessionDataFromContext(ctx: ExecutionContext) {
    const accessMode = this.getAccessModeFromContext(ctx);

    const http = ctx.switchToHttp();
    const req = http.getRequest<IncomingMessage>();
    const res = http.getResponse<ServerResponse>();

    const isOnline = accessMode === AccessMode.Online;
    let session: SessionInterface | undefined;
    try {
      session = await this.shopifyApi.session.getCurrent({
        rawRequest: req,
        rawResponse: res,
        isOnline,
      });
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
    return this.reflector.getAllAndOverride<AccessMode>(AUTH_MODE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  }
}
