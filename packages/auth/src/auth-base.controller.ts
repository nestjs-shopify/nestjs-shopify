import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import {
  SessionStorage,
  ShopifyCoreOptions,
  ShopifyFactory,
} from '@rh-nestjs-shopify/core';
import { Shopify } from '@shopify/shopify-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, ServerResponse } from 'node:http';
import { AccessMode, ShopifyAuthModuleOptions } from './auth.interfaces';
import { buildAuthParamScopePath } from './utils/build-auth-path.util';
import { joinUrl } from './utils/join-url.util';

@Controller('shopify')
export abstract class ShopifyAuthBaseController {
  constructor(
    protected readonly shopifyFactory: ShopifyFactory,
    protected readonly accessMode: AccessMode,
    protected readonly options: ShopifyAuthModuleOptions,
    protected readonly appConfig: ApplicationConfig,
    protected readonly sessionStorage: SessionStorage,
    protected readonly shopifyCoreOptions: ShopifyCoreOptions,
  ) {}

  @Get('auth')
  async auth(
    @Query('shop') domain: string,
    @Param() param: any,
    @Req() request: IncomingMessage | FastifyRequest,
    @Res() response: ServerResponse | FastifyReply,
  ) {
    const req = request instanceof IncomingMessage ? request : request.raw;
    const res = response instanceof ServerResponse ? response : response.raw;

    let globalPrefix = '';
    const { basePath = '', useGlobalPrefix } = this.options;
    const isOnline = this.accessMode === AccessMode.Online;

    if (useGlobalPrefix) {
      globalPrefix = this.appConfig.getGlobalPrefix();
    }

    const scope =
      param?.[`${this.shopifyCoreOptions.prefixParamScope || ''}`] || '';

    let callbackPath = joinUrl(globalPrefix, basePath, 'callback');
    callbackPath = buildAuthParamScopePath(
      callbackPath,
      this.shopifyCoreOptions.prefixParamScope,
      scope,
    );

    await (this.shopifyFactory.getInstance(scope) as Shopify).auth.begin({
      callbackPath,
      isOnline,
      rawRequest: req,
      rawResponse: res,
      shop: domain,
    });
  }

  @Get('callback')
  async callback(
    @Query('host') host: string,
    @Param() param: any,
    @Req() request: IncomingMessage | FastifyRequest,
    @Res() response: ServerResponse | FastifyReply,
  ) {
    const req = request instanceof IncomingMessage ? request : request.raw;
    const res = response instanceof ServerResponse ? response : response.raw;

    const scope =
      param?.[`${this.shopifyCoreOptions.prefixParamScope || ''}`] || '';

    const { headers = {}, session } = await (
      this.shopifyFactory.getInstance(scope) as Shopify
    ).auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    if (session) {
      await this.sessionStorage.storeSession(session);

      if (this.options.afterAuthHandler) {
        await this.options.afterAuthHandler.afterAuth(
          request,
          response,
          session,
        );
        return;
      }

      const { shop } = session;

      const redirectUrl = `/?shop=${shop}&host=${host}`;
      res
        .writeHead(302, {
          ...headers,
          location: redirectUrl,
        })
        .end(`Redirecting to ${redirectUrl}`);
      return;
    }

    res.writeHead(401).end('Invalid session');
  }
}
