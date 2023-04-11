import { SessionStorage } from '@nestjs-shopify/core';
import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import { Shopify } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { AccessMode, ShopifyAuthModuleOptions } from './auth.interfaces';
import { joinUrl } from './utils/join-url.util';

@Controller('shopify')
export abstract class ShopifyAuthBaseController {
  constructor(
    protected readonly shopifyApi: Shopify,
    protected readonly accessMode: AccessMode,
    protected readonly options: ShopifyAuthModuleOptions,
    protected readonly appConfig: ApplicationConfig,
    protected readonly sessionStorage: SessionStorage
  ) {}

  @Get('auth')
  async auth(
    @Query('shop') domain: string,
    @Req() req: IncomingMessage,
    @Res() res: ServerResponse
  ) {
    let globalPrefix = '';
    const { basePath = '', useGlobalPrefix } = this.options;
    const isOnline = this.accessMode === AccessMode.Online;

    if (useGlobalPrefix) {
      globalPrefix = this.appConfig.getGlobalPrefix();
    }

    const callbackPath = joinUrl(globalPrefix, basePath, 'callback');

    await this.shopifyApi.auth.begin({
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
    @Req() req: IncomingMessage,
    @Res() res: ServerResponse
  ) {
    const { headers = {}, session } = await this.shopifyApi.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });

    if (session) {
      await this.sessionStorage.storeSession(session);

      if (this.options.afterAuthHandler) {
        await this.options.afterAuthHandler.afterAuth(req, res, session);
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
