import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { SHOPIFY_HMAC_KEY, SHOPIFY_HMAC_SIGNATOR_KEY } from './hmac.constants';
import { ShopifyHmacType, ShopifyHmacSignator } from './hmac.enums';
import { ShopifyHmacGuard } from './hmac.guard';

export const ShopifyHmac = (
  hmacType: ShopifyHmacType,
  signator: ShopifyHmacSignator = ShopifyHmacSignator.Admin,
) =>
  applyDecorators(
    SetMetadata(SHOPIFY_HMAC_KEY, hmacType),
    SetMetadata(SHOPIFY_HMAC_SIGNATOR_KEY, signator),
    UseGuards(ShopifyHmacGuard),
  );
