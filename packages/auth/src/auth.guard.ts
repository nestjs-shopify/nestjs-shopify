import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Shopify from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';
import type { IncomingMessage, ServerResponse } from 'http';
import { RequestLike, ShopifyAuthSessionService } from './auth-session.service';
import { AUTH_MODE_KEY } from './auth.constants';
import { ReauthHeaderException, ReauthRedirectException } from './auth.errors';
import { AccessMode } from './auth.interfaces';
import { isSessionValid } from './utils/is-session-valid.util';

@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authSessionService: ShopifyAuthSessionService
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { accessMode, session } = await this.getSessionDataFromContext(ctx);

    if (session && isSessionValid(session)) {
      return true;
    }

    const req = ctx.switchToHttp().getRequest<IncomingMessage>();
    const shop = this.authSessionService.getShop(req as RequestLike, session);

    const isOnline = accessMode === AccessMode.Online;
    if (shop) {
      if (isOnline) {
        throw new ReauthHeaderException(shop, accessMode);
      }

      throw new ReauthRedirectException(shop, accessMode);
    }

    return false;
  }

  private async getSessionDataFromContext(ctx: ExecutionContext) {
    const accessMode = this.getAccessModeFromContext(ctx);

    const http = ctx.switchToHttp();
    const req = http.getRequest<IncomingMessage>();
    const res = http.getResponse<ServerResponse>();

    const isOnline = accessMode === AccessMode.Online;
    let session: Session | undefined;
    try {
      session = await Shopify.Utils.loadCurrentSession(req, res, isOnline);
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
