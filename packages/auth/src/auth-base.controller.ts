import { SessionStorage, ShopifyHttpAdapter } from '@nestjs-shopify/core';
import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import { Shopify } from '@shopify/shopify-api';
import {
  AccessMode,
  ShopifyAuthorizationCodeAuthModuleOptions,
} from './auth.interfaces';
import { joinUrl } from './utils/join-url.util';

@Controller('shopify')
export abstract class ShopifyAuthBaseController {
  constructor(
    protected readonly shopifyApi: Shopify,
    protected readonly accessMode: AccessMode,
    protected readonly options: ShopifyAuthorizationCodeAuthModuleOptions,
    protected readonly appConfig: ApplicationConfig,
    protected readonly sessionStorage: SessionStorage,
    protected readonly shopifyHttpAdapter: ShopifyHttpAdapter,
  ) {}

  @Get('auth')
  async auth(
    @Query('shop') domain: string,
    @Req() req: unknown,
    @Res() res: unknown,
  ) {
    let globalPrefix = '';
    const { basePath = '', useGlobalPrefix } = this.options;
    const isOnline = this.accessMode === AccessMode.Online;

    if (useGlobalPrefix) {
      globalPrefix = this.appConfig.getGlobalPrefix();
    }

    const callbackPath = joinUrl(globalPrefix, basePath, 'callback');

    await this.shopifyHttpAdapter.beginAuth(req, res, {
      callbackPath,
      isOnline,
      shop: domain,
    });
  }

  @Get('callback')
  async callback(
    @Query('host') host: string,
    @Req() req: unknown,
    @Res() res: unknown,
  ) {
    const rawRequest = this.shopifyHttpAdapter.getRawRequest(req);
    const rawResponse = this.shopifyHttpAdapter.getRawResponse(res);

    const { headers = {}, session } =
      await this.shopifyHttpAdapter.beginCallback(req, res);

    if (session) {
      await this.sessionStorage.storeSession(session);

      if (this.options.afterAuthHandler) {
        await this.options.afterAuthHandler.afterAuth(
          rawRequest,
          rawResponse,
          session,
        );
        return;
      }

      const { shop } = session;

      const redirectUrl = `/?shop=${shop}&host=${host}`;
      rawResponse
        .writeHead(302, {
          ...headers,
          location: redirectUrl,
        })
        .end(`Redirecting to ${redirectUrl}`);
      return;
    }

    rawResponse.writeHead(401).end('Invalid session');
  }
}
