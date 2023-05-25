import { InjectShopify } from '@nestjs-shopify/core';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ApplicationConfig, HttpAdapterHost, ModuleRef } from '@nestjs/core';
import { Shopify } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';
import { getOptionsToken } from './auth.constants';
import { ShopifyAuthException } from './auth.errors';
import { AccessMode, ShopifyAuthModuleOptions } from './auth.interfaces';
import { joinUrl } from './utils/join-url.util';
import { getRawReqAndRes } from './utils/get-raw-req-and-res.util';

@Catch(ShopifyAuthException)
export class ShopifyAuthExceptionFilter
  implements ExceptionFilter<ShopifyAuthException>
{
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly appConfig: ApplicationConfig,
    @InjectShopify()
    private readonly shopifyApi: Shopify,
    private readonly adapterHost: HttpAdapterHost
  ) {}

  async catch(exception: ShopifyAuthException, host: ArgumentsHost) {
    const options = this.getShopifyOptionsFor(exception.accessMode);
    const context = host.switchToHttp();

    const getReq = context.getRequest();
    const getRes = context.getResponse();
    getReq.statusCode = exception.getStatus();
    // get raw req & res
    const { rawRequest, rawResponse } = getRawReqAndRes(
      this.adapterHost,
      getReq,
      getRes
    );

    const hostScheme = this.shopifyApi.config.hostScheme ?? 'https';
    const hostName = this.shopifyApi.config.hostName ?? rawRequest.headers.host;
    const domain = `${hostScheme}://${hostName}`;
    const redirectPath = this.buildRedirectPath(exception.shop, options);
    const authUrl = new URL(redirectPath, domain).toString();

    if (options.returnHeaders) {
      rawResponse
        .setHeader('X-Shopify-Api-Request-Failure-Reauthorize', '1')
        .setHeader('X-Shopify-API-Request-Failure-Reauthorize-Url', authUrl);
    }

    switch (exception.accessMode) {
      case AccessMode.Offline:
        rawResponse.statusCode = 302;
        return rawResponse
          .setHeader('Location', authUrl)
          .end(`Redirecting to ${authUrl}`);
      case AccessMode.Online:
        return rawResponse.end(
          JSON.stringify({
            message: exception.message,
            statusCode: exception.getStatus(),
            timestamp: new Date().toISOString(),
          })
        );
    }
  }

  private buildRedirectPath(shop: string, options: ShopifyAuthModuleOptions) {
    let prefix = '';
    if (options.useGlobalPrefix) {
      prefix = this.appConfig.getGlobalPrefix();
    }

    const basePath = options.basePath || '';
    const authPath = `auth?shop=${shop}`;
    const redirectPath = joinUrl(prefix, basePath, authPath);

    return redirectPath;
  }

  private getShopifyOptionsFor(accessMode: AccessMode) {
    return this.moduleRef.get<ShopifyAuthModuleOptions>(
      getOptionsToken(accessMode),
      { strict: false }
    );
  }
}
