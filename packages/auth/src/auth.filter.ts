import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  OnModuleInit,
} from '@nestjs/common';
import { ApplicationConfig, ModuleRef } from '@nestjs/core';
import type { IncomingMessage, ServerResponse } from 'http';
import { SHOPIFY_AUTH_OPTIONS } from './auth.constants';
import {
  ReauthHeaderException,
  ReauthRedirectException,
  ShopifyAuthException,
} from './auth.errors';
import { ShopifyAuthModuleOptions } from './auth.interfaces';
import { joinUrl } from './utils/join-url.util';

@Catch(ShopifyAuthException)
export class ShopifyAuthExceptionFilter
  implements ExceptionFilter<ShopifyAuthException>, OnModuleInit
{
  private options!: ShopifyAuthModuleOptions;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly appConfig: ApplicationConfig
  ) {}

  async onModuleInit() {
    this.options = await this.moduleRef.resolve(SHOPIFY_AUTH_OPTIONS);
  }

  async catch(exception: ShopifyAuthException, host: ArgumentsHost) {
    const context = host.switchToHttp();

    const req = context.getRequest<IncomingMessage>();
    const res = context.getResponse<ServerResponse>();

    let prefix = '';
    if (this.options.useGlobalPrefix) {
      prefix = this.appConfig.getGlobalPrefix();
    }

    const domain = `https://${req.headers.host}`;
    const status = exception.getStatus();
    const basePath = this.options.basePath || '';

    if (exception instanceof ReauthHeaderException) {
      const authPath = `auth?shop=${exception.shop}`;
      const redirectPath = joinUrl(prefix, basePath, authPath);
      const authUrl = new URL(redirectPath, domain).toString();

      res
        .setHeader('X-Shopify-Api-Request-Failure-Reauthorize', '1')
        .setHeader('X-Shopify-API-Request-Failure-Reauthorize-Url', authUrl)
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
      const authPath = `auth?shop=${exception.shop}`;
      const redirectPath = joinUrl(prefix, basePath, authPath);
      const authUrl = new URL(redirectPath, domain).toString();

      res
        .writeHead(302, { location: authUrl })
        .end(`Redirecting to ${authUrl}`);
    } else {
      res.writeHead(400).end('No session found');
    }
  }
}
