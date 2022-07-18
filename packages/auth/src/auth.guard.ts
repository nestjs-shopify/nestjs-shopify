import {
  CanActivate,
  ExecutionContext,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import Shopify from '@shopify/shopify-api';
import { Session } from '@shopify/shopify-api/dist/auth/session';
import type { IncomingMessage, ServerResponse } from 'http';
import { AUTH_MODE_KEY } from './auth.constants';
import { AccessMode } from './auth.interfaces';
import { ShopifyAuthService } from './auth.service';

@Injectable()
export class ShopifyAuthGuard implements CanActivate, OnModuleInit {
  private service!: ShopifyAuthService;

  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef
  ) {}

  async onModuleInit() {
    console.log(await this.moduleRef.resolve(ShopifyAuthService));
  }

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const http = ctx.switchToHttp();
    const req = http.getRequest<IncomingMessage>();
    const res = http.getResponse<ServerResponse>();

    const accessMode = this.reflector.getAllAndOverride<AccessMode>(
      AUTH_MODE_KEY,
      [ctx.getHandler(), ctx.getClass()]
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
      const serverHost = req.headers.host as string;
      this.service.handleAuthException(res, serverHost, shop, isOnline);
    }

    return false;
  }
}
