import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import Shopify from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { AccessMode, ShopifyAuthModuleOptions } from './auth.interfaces';
import { joinUrl } from './utils/join-url.util';

@Controller('shopify')
export abstract class ShopifyAuthBaseController {
  constructor(
    protected readonly accessMode: AccessMode,
    protected readonly options: ShopifyAuthModuleOptions,
    protected readonly appConfig: ApplicationConfig
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

    const redirectPath = joinUrl(globalPrefix, basePath, 'callback');
    const redirectUrl = new URL(redirectPath, 'http://' + req.headers.host);

    const oauthUrl = await Shopify.Auth.beginAuth(
      req,
      res,
      domain,
      redirectUrl.href,
      isOnline
    );

    res
      .writeHead(302, { location: oauthUrl })
      .end(`Redirecting to ${oauthUrl}`);
  }

  @Get('callback')
  async callback(
    @Req() req: IncomingMessage,
    @Res() res: ServerResponse,
    @Query() query: Record<string, string>
  ) {
    const session = await Shopify.Auth.validateAuthCallback(req, res, {
      code: query['code'],
      shop: query['shop'],
      host: query['host'],
      state: query['state'],
      timestamp: query['timestamp'],
      hmac: query['hmac'],
    });

    if (session) {
      if (this.options.afterAuthHandler) {
        await this.options.afterAuthHandler.afterAuth(req, res, session);
        return;
      }

      const redirectUrl = `/?shop=${query['shop']}&host=${query['host']}`;
      res
        .writeHead(302, { location: redirectUrl })
        .end(`Redirecting to ${redirectUrl}`);
      return;
    }

    res.writeHead(401).end('Invalid session');
  }
}
