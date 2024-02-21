import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectShopify, ShopifyHttpAdapter } from '@nestjs-shopify/core';
import {
  AuthQuery,
  InvalidHmacError,
  Shopify,
  ShopifyHeader,
} from '@shopify/shopify-api';
import { createHmac, timingSafeEqual } from 'crypto';
import { SHOPIFY_HMAC_KEY } from './hmac.constants';
import { ShopifyHmacType } from './hmac.enums';

@Injectable()
export class ShopifyHmacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectShopify() private readonly shopifyApi: Shopify,
    private readonly shopifyHttpAdapter: ShopifyHttpAdapter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const hmacType = this.getShopifyHmacTypeFromContext(context);
    if (!hmacType) {
      return true;
    }

    switch (hmacType) {
      case ShopifyHmacType.Query:
        return this.validateHmacQuery(context);
      case ShopifyHmacType.Header:
        return this.validateHmacHeader(context);
    }
  }

  private validateHmacHeader(context: ExecutionContext) {
    const rawBody =
      this.shopifyHttpAdapter.getRawBodyFromExecutionContext(context);
    const expectedHmac = this.getHmacFromHeaders(context);

    if (!rawBody) {
      throw new InternalServerErrorException(
        `Missing raw body in request. Ensure that 'rawBody' option is set when initializing Nest application.`,
      );
    }

    const generatedHash = createHmac(
      'sha256',
      this.shopifyApi.config.apiSecretKey,
    )
      .update(rawBody)
      .digest('base64');
    const generatedHashBuffer = Buffer.from(generatedHash);
    const hmacBuffer = Buffer.from(expectedHmac);

    if (generatedHashBuffer.length !== hmacBuffer.length) {
      throw new UnauthorizedException('Webhook HMAC validation failed.');
    }

    if (!timingSafeEqual(generatedHashBuffer, hmacBuffer)) {
      throw new UnauthorizedException('Webhook HMAC validation failed.');
    }

    return true;
  }

  private async validateHmacQuery(context: ExecutionContext) {
    const query =
      this.shopifyHttpAdapter.getQueryParamsFromExecutionContext<AuthQuery>(
        context,
      );

    try {
      if (await this.shopifyApi.utils.validateHmac(query)) {
        return true;
      }

      throw new InvalidHmacError('Invalid HMAC provided in query params');
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  private getHmacFromHeaders(context: ExecutionContext): string {
    const headers =
      this.shopifyHttpAdapter.getHeadersFromExecutionContext(context);
    const hmacHeader =
      headers[ShopifyHeader.Hmac] || headers[ShopifyHeader.Hmac.toLowerCase()];

    if (!hmacHeader) {
      throw new BadRequestException(
        `Missing required HTTP header: ${ShopifyHeader.Hmac}`,
      );
    }

    if (typeof hmacHeader !== 'string') {
      throw new BadRequestException(
        `Malformed '${ShopifyHeader.Hmac}' provided: ${hmacHeader}`,
      );
    }

    return hmacHeader;
  }

  private getShopifyHmacTypeFromContext(
    context: ExecutionContext,
  ): ShopifyHmacType | undefined {
    return this.reflector.getAllAndOverride<ShopifyHmacType | undefined>(
      SHOPIFY_HMAC_KEY,
      [context.getHandler(), context.getClass()],
    );
  }
}
