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
import { InjectGetSharedSecret, InjectShopify } from '../core.decorators';
import { SHOPIFY_HMAC_KEY } from './hmac.constants';
import { ShopifyHmacType } from './hmac.enums';
import { SharedSecretGetter } from "../core.interfaces";

@Injectable()
export class ShopifyHmacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectShopify() private readonly shopifyApi: Shopify,
    @InjectGetSharedSecret() private readonly getSharedSecret: SharedSecretGetter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const hmacType = this.getShopifyHmacTypeFromContext(context);
    if (!hmacType) {
      return true;
    }

    const req: RawBodyRequest<IncomingMessage> = context
      .switchToHttp()
      .getRequest();

    switch (hmacType) {
      case ShopifyHmacType.Query:
        return this.validateHmacQuery(req);
      case ShopifyHmacType.Header:
        return this.validateHmacHeader(req);
    }
  }

  private async validateHmacHeader(req: RawBodyRequest<IncomingMessage>) {
    let authenticated: boolean = false;

    const expectedHmac = this.getHmacFromHeaders(req);

    if (!req.rawBody) {
      throw new InternalServerErrorException(
        `Missing raw body in request. Ensure that 'rawBody' option is set when initializing Nest application.`,
      );
    }
    const hmacBuffer = Buffer.from(expectedHmac);

    const generatedHash = createHmac(
      'sha256',
      this.shopifyApi.config.apiSecretKey,
    )
      .update(req.rawBody)
      .digest('base64');
    const generatedHashBuffer = Buffer.from(generatedHash);

    if (generatedHashBuffer.length === hmacBuffer.length && timingSafeEqual(generatedHashBuffer, hmacBuffer)) {
      authenticated = true;
    } else {
      const domainFromHeader = this.getDomainFromHeaders(req);

      const sharedSecret = await this.getSharedSecret(domainFromHeader);
      if (sharedSecret) {
        const sharedSecretGeneratedHash = createHmac(
          'sha256',
          sharedSecret,
        )
          .update(req.rawBody)
          .digest('base64');

        const sharedSecretGeneratedHashBuffer = Buffer.from(sharedSecretGeneratedHash);
        if (sharedSecretGeneratedHashBuffer.length === hmacBuffer.length && timingSafeEqual(sharedSecretGeneratedHashBuffer, hmacBuffer)) {
          authenticated = true;
        }
      }
    }

    return authenticated;
  }

  private async validateHmacQuery(req: IncomingMessage) {
    const query = (req as unknown as { query: AuthQuery }).query;

    try {
      if (await this.shopifyApi.utils.validateHmac(query)) {
        return true;
      }

      throw new InvalidHmacError('Invalid HMAC provided in query params');
    } catch (err) {
      throw new UnauthorizedException(err);
    }
  }

  private getDomainFromHeaders(req: IncomingMessage): string {
    const domainHeader =
      req.headers[ShopifyHeader.Domain] ||
      req.headers[ShopifyHeader.Domain.toLowerCase()];

    if (!domainHeader) {
      throw new BadRequestException(
        `Missing required HTTP header: ${ShopifyHeader.Domain}`,
      );
    }

    if (typeof domainHeader !== 'string') {
      throw new BadRequestException(
        `Malformed '${ShopifyHeader.Domain}' provided: ${domainHeader}`,
      );
    }

    return domainHeader;
  }

  private getHmacFromHeaders(req: IncomingMessage): string {
    const hmacHeader =
      req.headers[ShopifyHeader.Hmac] ||
      req.headers[ShopifyHeader.Hmac.toLowerCase()];

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
