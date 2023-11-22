import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  InjectShopify,
  InjectShopifySessionStorage,
  SessionStorage,
  ShopifyFactory,
} from '@rh-nestjs-shopify/core';
import { InvalidSession, Session, Shopify } from '@shopify/shopify-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, ServerResponse } from 'node:http';
import { AUTH_MODE_KEY } from './auth.constants';
import { ShopifyAuthException } from './auth.errors';
import { AccessMode, ShopifySessionRequest } from './auth.interfaces';
import {
  RequestLike,
  getShopFromRequest,
} from './utils/get-shop-from-request.util';

@Injectable()
export class ShopifyAuthGuard implements CanActivate {
  private readonly logger = new Logger(ShopifyAuthGuard.name);

  constructor(
    @InjectShopify()
    private readonly shopifyFactory: ShopifyFactory,
    @InjectShopifySessionStorage()
    private readonly sessionStorage: SessionStorage,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const { accessMode, session } = await this.getSessionDataFromContext(ctx);
    let check = false;
    let shopifyInstance = this.shopifyFactory.getInstance();
    for (const instance of this.shopifyFactory.getInstances()) {
      if (session && session.isActive(instance[1].config.scopes)) {
        check = true;
        shopifyInstance = instance[1];
        break;
      }
    }

    if (session && check) {
      // We assign the session to the request for further usage in
      // our controllers/decorators
      this.assignSessionToRequest(ctx, session);
      console.log('[ShopifyAuthGuard] TRUE');

      return true;
    }
    console.log('[ShopifyAuthGuard] FALSE');

    const req = ctx
      .switchToHttp()
      .getRequest<IncomingMessage | FastifyRequest>();
    const shop = getShopFromRequest(req as RequestLike, session);

    if (shop) {
      throw new ShopifyAuthException(
        'Reauthorization Required',
        shop,
        accessMode,
      );
    }

    return false;
  }

  private assignSessionToRequest(
    ctx: ExecutionContext,
    session: Session | undefined,
  ) {
    const req = ctx
      .switchToHttp()
      .getRequest<ShopifySessionRequest<IncomingMessage | FastifyRequest>>();
    req.shopifySession = session;
  }

  private async getSessionDataFromContext(ctx: ExecutionContext) {
    const accessMode = this.getAccessModeFromContext(ctx);

    const http = ctx.switchToHttp();
    const request = http.getRequest<IncomingMessage | FastifyRequest>();
    const response = http.getResponse<ServerResponse | FastifyReply>();
    const req = request instanceof IncomingMessage ? request : request.raw;
    const res = response instanceof ServerResponse ? response : response.raw;

    const isOnline = accessMode === AccessMode.Online;
    let session: Session | undefined;

    try {
      /**
       * decode jwt -> dont care instance
       * @returns `day-la-shop-test-1.myshopify.com_103420526893`
       */
      const sessionId = await (
        this.shopifyFactory.getInstance('DEFAULT') as Shopify
      ).session.getCurrentId({
        rawRequest: req,
        rawResponse: res,
        isOnline,
      });

      if (!sessionId) {
        throw new InvalidSession('No session found');
      }

      session = await this.sessionStorage.loadSession(sessionId);

      if (session && session.expires && session.expires <= new Date()) {
        session = undefined;
      }
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
