import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SessionInterface, Shopify } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { RequestLike, ShopifyAuthSessionService } from './auth-session.service';
import { AUTH_MODE_KEY } from './auth.constants';
import { ShopifyAuthException } from './auth.errors';
import { AccessMode } from './auth.interfaces';

@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  constructor(
    @Inject(SHOPIFY_API_CONTEXT)
    private readonly shopifyApi: Shopify,
    private readonly reflector: Reflector,
    private readonly authSessionService: ShopifyAuthSessionService
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { accessMode, session } = await this.getSessionDataFromContext(ctx);

    if (session && this.authSessionService.isValid(session)) {
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
    } catch {
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
