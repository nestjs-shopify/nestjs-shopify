import { Inject, Injectable } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import { ServerResponse } from 'http';
import { SHOPIFY_AUTH_OPTIONS } from './auth.constants';
import { ShopifyAuthModuleOptions } from './auth.interfaces';
import { joinUrl } from './utils/join-url.util';

@Injectable()
export class ShopifyAuthService {
  constructor(
    @Inject(SHOPIFY_AUTH_OPTIONS)
    private readonly options: ShopifyAuthModuleOptions,
    private readonly appConfig: ApplicationConfig
  ) {}

  handleAuthException(
    res: ServerResponse,
    serverHost: string,
    shop: string,
    isOnline = true
  ) {
    let prefix = '';
    if (this.options.useGlobalPrefix) {
      prefix = this.appConfig.getGlobalPrefix();
    }

    const domain = `https://${serverHost}`;
    const status = 401;
    const basePath = this.options.basePath || '';
    const authPath = `auth?shop=${shop}`;
    const redirectPath = joinUrl(prefix, basePath, authPath);
    const authUrl = new URL(redirectPath, domain).toString();

    if (isOnline) {
      res
        .setHeader('X-Shopify-Api-Request-Failure-Reauthorize', '1')
        .setHeader('X-Shopify-API-Request-Failure-Reauthorize-Url', authUrl)
        .writeHead(401, {
          'X-Shopify-Api-Request-Failure-Reauthorize': '1',
          'X-Shopify-API-Request-Failure-Reauthorize-Url': authUrl,
        })
        .end(
          JSON.stringify({
            statusCode: status,
            timestamp: new Date().toISOString(),
            message: `Unauthorized`,
          })
        );
    } else {
      res
        .writeHead(302, { location: authUrl })
        .end(`Redirecting to ${authUrl}`);
    }
  }
}
