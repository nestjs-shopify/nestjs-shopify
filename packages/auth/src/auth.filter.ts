import { ArgumentsHost, Catch, ExceptionFilter, Inject } from '@nestjs/common';
import { ApplicationConfig, ModuleRef } from '@nestjs/core';
import {
  InjectShopify,
  InjectShopifySessionStorage,
  SHOPIFY_CORE_OPTIONS,
  SessionStorage,
  ShopifyCoreOptions,
  ShopifyFactory,
} from '@rh-nestjs-shopify/core';
import { HttpResponseError, Session, Shopify } from '@shopify/shopify-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import { IncomingMessage, ServerResponse } from 'node:http';
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
    private readonly shopifyFactory: ShopifyFactory,
    @InjectShopifySessionStorage()
    private readonly sessionStorage: SessionStorage,
    @Inject(SHOPIFY_CORE_OPTIONS)
    private readonly shopifyCoreOptions: ShopifyCoreOptions,
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
        return this.handleShopifyAuthException(
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
      return this.handleShopifyAuthException(exception, req, res);
    }
    return res.end(JSON.stringify(responseBody));
  }

  private handleShopifyAuthException(
    exception: ShopifyAuthException,
    req: IncomingMessage,
    res: ServerResponse,
  ) {
    const options = this.getShopifyOptionsFor(exception.accessMode);
    res.statusCode = exception.getStatus();

    const keyShopifyInstance = 'DEFAULT';
    const shopifyInstance = this.shopifyFactory.getInstance(
      keyShopifyInstance,
    ) as Shopify;

    const hostScheme = shopifyInstance.config.hostScheme ?? 'https';
    const hostName = shopifyInstance.config.hostName ?? req.headers.host;
    const domain = `${hostScheme}://${hostName}`;
    const redirectPath = this.buildRedirectPath(
      exception.shop,
      options,
      keyShopifyInstance,
    );
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

  private buildRedirectPath(
    shop: string,
    options: ShopifyAuthModuleOptions,
    keyShopifyInstance: string,
  ) {
    let prefix = '';
    if (options.useGlobalPrefix) {
      prefix = this.appConfig.getGlobalPrefix();
    }

    console.log('[buildRedirectPath] , [ShopifyAuthExceptionFilter]');

    const basePath = options.basePath || '';
    const authPath = `auth?shop=${shop}`;
    const redirectPath = joinUrl(prefix, basePath, authPath);
    if (this.shopifyCoreOptions.prefix) {
      return redirectPath.replace(
        this.shopifyCoreOptions.prefix,
        keyShopifyInstance,
      );
    }
    return redirectPath;
  }

  private getShopifyOptionsFor(accessMode: AccessMode) {
    return this.moduleRef.get<ShopifyAuthModuleOptions>(
      getOptionsToken(accessMode),
      { strict: false },
    );
  }
}
