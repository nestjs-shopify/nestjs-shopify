import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ApplicationConfig, ModuleRef } from '@nestjs/core';
import type { IncomingMessage, ServerResponse } from 'http';
import { getOptionsToken } from './auth.constants';
import {
  ReauthHeaderException,
  ReauthRedirectException,
  ShopifyAuthException,
} from './auth.errors';
import { AccessMode, ShopifyAuthModuleOptions } from './auth.interfaces';
import { joinUrl } from './utils/join-url.util';

@Catch(ShopifyAuthException)
export class ShopifyAuthExceptionFilter
  implements ExceptionFilter<ShopifyAuthException>
{
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly appConfig: ApplicationConfig
  ) {}

  async catch(exception: ShopifyAuthException, host: ArgumentsHost) {
    const options = this.getShopifyOptionsFor(exception.accessMode);
    const context = host.switchToHttp();

    const req = context.getRequest<IncomingMessage>();
    const res = context.getResponse<ServerResponse>();

    const domain = `https://${req.headers.host}`;
    const status = exception.getStatus();

    if (exception instanceof ReauthHeaderException) {
      const redirectPath = this.buildRedirectPath(exception.shop, options);
      const authUrl = new URL(redirectPath, domain).toString();

      res
        .writeHead(status, {
          'X-Shopify-Api-Request-Failure-Reauthorize': '1',
          'X-Shopify-API-Request-Failure-Reauthorize-Url': authUrl,
        })
        .end(
          JSON.stringify({
            statusCode: status,
            timestamp: new Date().toISOString(),
            message: exception.message,
          })
        );
    } else if (exception instanceof ReauthRedirectException) {
      const redirectPath = this.buildRedirectPath(exception.shop, options);
      const authUrl = new URL(redirectPath, domain).toString();

      res
        .writeHead(302, { location: authUrl })
        .end(`Redirecting to ${authUrl}`);
    } else {
      res.writeHead(400).end('No session found');
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
