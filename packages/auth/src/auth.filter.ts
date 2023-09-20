import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ApplicationConfig, ModuleRef } from '@nestjs/core';
import { InjectShopify } from '@rh-nestjs-shopify/core';
import { HttpResponseError, Session, Shopify } from '@shopify/shopify-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { getOptionsToken } from './auth.constants';
import { ShopifyAuthException } from './auth.errors';
import {
  AccessMode,
  ShopifyAuthModuleOptions,
  ShopifySessionRequest,
} from './auth.interfaces';
import { joinUrl } from './utils/join-url.util';

@Catch(ShopifyAuthException, HttpResponseError)
export class ShopifyAuthExceptionFilter
  implements ExceptionFilter<ShopifyAuthException | HttpResponseError>
{
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly appConfig: ApplicationConfig,
    @InjectShopify()
    private readonly shopifyApi: Shopify,
  ) {}

  async catch(
    exception: ShopifyAuthException | HttpResponseError,
    host: ArgumentsHost,
  ) {
    const context = host.switchToHttp();
    const request =
      context.getRequest<
        ShopifySessionRequest<IncomingMessage | FastifyRequest>
      >();
    const response = context.getResponse<ServerResponse | FastifyReply>();

    const req = request instanceof IncomingMessage ? request : request.raw;
    const res = response instanceof ServerResponse ? response : response.raw;

    const responseBody = {
      message: exception.message,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    };
    if (exception instanceof HttpResponseError) {
      if (exception.response.code === 401) {
        return this.hanldeShopifyAuthException(
          new ShopifyAuthException(
            exception.message,
            (request.shopifySession as Session).shop,
            AccessMode.Online,
          ),
          req,
          res,
        );
      } else {
        return res.end(
          JSON.stringify({
            message: exception.message,
            statusCode: exception.response.code,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    } else if (exception instanceof ShopifyAuthException) {
      return this.hanldeShopifyAuthException(exception, req, res);
    }
    return res.end(JSON.stringify(responseBody));
  }

  private hanldeShopifyAuthException(
    exception: ShopifyAuthException,
    req: IncomingMessage,
    res: ServerResponse,
  ) {
    const options = this.getShopifyOptionsFor(exception.accessMode);
    res.statusCode = exception.getStatus();

    const hostScheme = this.shopifyApi.config.hostScheme ?? 'https';
    const hostName = this.shopifyApi.config.hostName ?? req.headers.host;
    const domain = `${hostScheme}://${hostName}`;
    const redirectPath = this.buildRedirectPath(exception.shop, options);
    const authUrl = new URL(redirectPath, domain).toString();

    if (options.returnHeaders) {
      res
        .setHeader('X-Shopify-Api-Request-Failure-Reauthorize', '1')
        .setHeader('X-Shopify-API-Request-Failure-Reauthorize-Url', authUrl);
    }

    switch (exception.accessMode) {
      case AccessMode.Offline:
        res.statusCode = 302;
        return res
          .setHeader('Location', authUrl)
          .end(`Redirecting to ${authUrl}`);
      case AccessMode.Online:
        return res.end(
          JSON.stringify({
            message: exception.message,
            statusCode: exception.getStatus(),
            timestamp: new Date().toISOString(),
          }),
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
      { strict: false },
    );
  }
}
