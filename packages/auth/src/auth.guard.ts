import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import Shopify from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';
import type { IncomingMessage, ServerResponse } from 'http';
import { AUTH_MODE_KEY, getOptionsToken } from './auth.constants';
import { ReauthHeaderException, ReauthRedirectException } from './auth.errors';
import { AccessMode, ShopifyAuthModuleOptions } from './auth.interfaces';

@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const http = ctx.switchToHttp();
    const req = http.getRequest<IncomingMessage>();
    const res = http.getResponse<ServerResponse>();

    const accessMode = this.reflector.getAllAndOverride<AccessMode>(
      AUTH_MODE_KEY,
      [ctx.getHandler(), ctx.getClass()]
    );
    const options = this.moduleRef.get<ShopifyAuthModuleOptions>(
      getOptionsToken(accessMode),
      { strict: false }
    );

    const isOnline = accessMode === AccessMode.Online;
    let session: Session | undefined;
    try {
      session = await Shopify.Utils.loadCurrentSession(req, res, isOnline);
    } catch {
      session = undefined;
    }

    if (session) {
      const scopesChanged = !Shopify.Context.SCOPES.equals(session.scope);

      if (
        !scopesChanged &&
        session.accessToken &&
        (!session.expires || new Date(session.expires) >= new Date())
      ) {
        return true;
      }
    }

    let shop: string | undefined;
    let authHeader: string | undefined;
    if (Shopify.Context.IS_EMBEDDED_APP) {
      authHeader = req.headers.authorization;
    }

    const query = Object.fromEntries(
      new URLSearchParams(req.url?.split('?')?.[1] || '').entries()
    );

    if (authHeader) {
      if (session) {
        shop = session.shop;
      } else if (authHeader) {
        const matches = authHeader?.match(/Bearer (.*)/);
        if (matches) {
          try {
            const payload = Shopify.Utils.decodeSessionToken(matches[1]);
            shop = payload.dest.replace('https://', '');
          } catch (error) {
            shop = query['shop'];
          }
        }
      }
    } else if (!isOnline) {
      shop = query['shop'];
    }

    if (shop) {
      if (isOnline) {
        throw new ReauthHeaderException(shop, options);
      }

      throw new ReauthRedirectException(shop, options);
    }

    return false;
  }
}
