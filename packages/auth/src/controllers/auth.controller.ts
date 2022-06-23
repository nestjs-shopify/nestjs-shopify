import { Controller, Get, Inject, Query, Req, Res } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import Shopify, { AuthQuery } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { SHOPIFY_ACCESS_MODE, SHOPIFY_AUTH_OPTIONS } from '../auth.constants';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';
import { joinUrl } from '../utils/join-url.util';

@Controller()
abstract class ShopifyAuthController {
  constructor(
    @Inject(SHOPIFY_ACCESS_MODE)
    private readonly accessMode: AccessMode,
    @Inject(SHOPIFY_AUTH_OPTIONS)
    private readonly options: ShopifyAuthModuleOptions,
    private readonly appConfig: ApplicationConfig
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

    const redirectUrl = joinUrl(globalPrefix, basePath, 'callback');

    const oauthUrl = await Shopify.Auth.beginAuth(
      req,
      res,
      domain,
      redirectUrl,
      isOnline
    );

    res
      .writeHead(302, { Location: oauthUrl })
      .end(`Redirecting to ${oauthUrl}`);
  }

  @Get('callback')
  async callback(@Req() req: IncomingMessage, @Res() res: ServerResponse) {
    const query = new URLSearchParams(
      req.url
    ).entries() as unknown as AuthQuery;
    const session = await Shopify.Auth.validateAuthCallback(req, res, query);

    if (session) {
      if (this.options.afterAuthHandler) {
        await this.options.afterAuthHandler.afterAuth(req, res, session);
        return;
      }

      const redirectUrl = `/?shop=${query.shop}&host=${query.host}`;
      res
        .writeHead(302, { Location: redirectUrl })
        .end(`Redirecting to ${redirectUrl}`);
      return;
    }

    res.writeHead(401).end(`Invalid session`);
  }
}

@Controller('shopify/online')
export class ShopifyAuthOnlineController extends ShopifyAuthController {}

@Controller('shopify/offline')
export class ShopifyAuthOfflineController extends ShopifyAuthController {}
