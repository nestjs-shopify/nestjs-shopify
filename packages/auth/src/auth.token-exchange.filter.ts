import { ShopifyHttpAdapter } from '@nestjs-shopify/core';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getAuthOptionsToken } from './auth.constants';
import { ShopifyAuthTokenExchangeException } from './auth.errors';
import {
  AccessMode,
  ShopifyTokenExchangeAuthModuleOptions,
} from './auth.interfaces';

@Catch(ShopifyAuthTokenExchangeException)
export class ShopifyAuthTokenExchangeExceptionFilter
  implements ExceptionFilter<ShopifyAuthTokenExchangeException>
{
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly shopifyHttpAdapter: ShopifyHttpAdapter,
  ) {}

  async catch(
    exception: ShopifyAuthTokenExchangeException,
    host: ArgumentsHost,
  ) {
    const options = this.getTokenExchangeOptionsFor(exception.accessMode);
    const context = host.switchToHttp();

    const res = context.getResponse();
    const rawResponse = this.shopifyHttpAdapter.getRawResponse(res);
    if (options.returnHeaders) {
      rawResponse.setHeader('X-Shopify-Retry-Invalid-Session-Request', '1');
    }

    rawResponse.statusCode = 401;

    return rawResponse.end(
      JSON.stringify({
        message: exception.message,
      }),
    );
  }

  private getTokenExchangeOptionsFor(accessMode: AccessMode) {
    return this.moduleRef.get<ShopifyTokenExchangeAuthModuleOptions>(
      getAuthOptionsToken(accessMode),
      { strict: false },
    );
  }
}
