import { ShopifyHttpAdapter } from '@nestjs-shopify/core';
import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TOKEN_EXCHANGE_OPTIONS_TOKEN } from './auth.constants';
import { ShopifyAuthTokenExchangeException } from './auth.errors';
import { ShopifyAuthModuleTokenExchangeOptions } from './auth.interfaces';

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
    const options = this.getTokenExchangeOptions();
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

  private getTokenExchangeOptions() {
    return this.moduleRef.get<ShopifyAuthModuleTokenExchangeOptions>(
      TOKEN_EXCHANGE_OPTIONS_TOKEN,
      { strict: false },
    );
  }
}
