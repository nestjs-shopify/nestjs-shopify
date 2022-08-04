import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import type { IncomingMessage, ServerResponse } from 'http';
import {
  ReauthHeaderException,
  ReauthRedirectException,
  ShopifyAuthException,
} from './auth.errors';
import { joinUrl } from './utils/join-url.util';

@Catch(ReauthHeaderException, ReauthRedirectException)
export class ShopifyAuthExceptionFilter
  implements ExceptionFilter<ShopifyAuthException>
{
  constructor(private readonly appConfig: ApplicationConfig) {}

  async catch(exception: ShopifyAuthException, host: ArgumentsHost) {
    const { options } = exception;
    const context = host.switchToHttp();

    const req = context.getRequest<IncomingMessage>();
    const res = context.getResponse<ServerResponse>();

    let prefix = '';
    if (options.useGlobalPrefix) {
      prefix = this.appConfig.getGlobalPrefix();
    }

    const domain = `https://${req.headers.host}`;
    const status = exception.getStatus();
    const basePath = options.basePath || '';

    if (exception instanceof ReauthHeaderException) {
      const authPath = `auth?shop=${exception.shop}`;
      const redirectPath = joinUrl(prefix, basePath, authPath);
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
