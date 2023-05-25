import { SessionStorage } from '@nestjs-shopify/core';
import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ApplicationConfig, HttpAdapterHost } from '@nestjs/core';
import { Shopify } from '@shopify/shopify-api';
import { AccessMode, ShopifyAuthModuleOptions } from './auth.interfaces';
import { getRawReqAndRes } from './utils/get-raw-req-and-res.util';
import { joinUrl } from './utils/join-url.util';

@Controller('shopify')
export abstract class ShopifyAuthBaseController {
  constructor(
    protected readonly shopifyApi: Shopify,
    protected readonly accessMode: AccessMode,
    protected readonly options: ShopifyAuthModuleOptions,
    protected readonly appConfig: ApplicationConfig,
    protected readonly sessionStorage: SessionStorage,
    protected readonly adapterHost: HttpAdapterHost
  ) {}

  @Get('auth')
  async auth(
    @Query('shop') domain: string,
    @Req() req: any,
    @Res() res: any
  ) {
    const { rawRequest, rawResponse } = getRawReqAndRes(
      this.adapterHost,
      req,
      res
    );

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
      rawRequest: rawRequest,
      rawResponse: rawResponse,
      shop: domain,
    });
  }

  @Get('callback')
  async callback(
    @Query('host') host: string,
    @Req() req: any,
    @Res() res: any
  ) {
    const { rawRequest, rawResponse } = getRawReqAndRes(
      this.adapterHost,
      req,
      res
    );
    const { headers = {}, session } = await this.shopifyApi.auth.callback({
      rawRequest: rawRequest,
      rawResponse: rawResponse,
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
