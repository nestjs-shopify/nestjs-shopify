import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  RawBodyRequest,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AuthQuery,
  InvalidHmacError,
  Shopify,
  ShopifyHeader,
} from '@shopify/shopify-api';
import { createHmac, timingSafeEqual } from 'crypto';
import { IncomingMessage } from 'http';
import { InjectShopify } from '../core.decorators';
import { SHOPIFY_HMAC_KEY } from './hmac.constants';
import { ShopifyHmacType } from './hmac.enums';
import { ShopifyCoreRequestWrapper } from '../core.request-wrapper';

@Injectable()
export class ShopifyHmacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectShopify() private readonly shopifyApi: Shopify,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const hmacType = this.getShopifyHmacTypeFromContext(context);
    if (!hmacType) {
      return true;
    }

    const abstractReq: RawBodyRequest<unknown> = context
      .switchToHttp()
      .getRequest();

    const { rawBody } = abstractReq;
    const req = ShopifyCoreRequestWrapper.getRawRequest(
      abstractReq,
    ) as IncomingMessage & {
      query: AuthQuery;
    };

    switch (hmacType) {
      case ShopifyHmacType.Query:
        return this.validateHmacQuery(req.query);
      case ShopifyHmacType.Header:
        return this.validateHmacHeader(rawBody, req.headers);
    }
  }

  private validateHmacHeader(
    rawBody: Buffer | undefined,
    headers: IncomingMessage['headers'],
  ) {
    const expectedHmac = this.getHmacFromHeaders(headers);

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

  private async validateHmacQuery(query: AuthQuery) {
    try {
      if (await this.shopifyApi.utils.validateHmac(query)) {
        return true;
      }

      throw new InvalidHmacError('Invalid HMAC provided in query params');
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  private getHmacFromHeaders(headers: IncomingMessage['headers']): string {
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
    ctx: ExecutionContext,
  ): ShopifyHmacType | undefined {
    return this.reflector.getAllAndOverride<ShopifyHmacType | undefined>(
      SHOPIFY_HMAC_KEY,
      [ctx.getHandler(), ctx.getClass()],
    );
  }
}
