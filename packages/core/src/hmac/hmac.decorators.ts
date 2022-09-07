import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { SHOPIFY_HMAC_KEY } from './hmac.constants';
import { ShopifyHmacType } from './hmac.enums';
import { ShopifyHmacGuard } from './hmac.guard';

export const ShopifyHmac = (hmacType: ShopifyHmacType) =>
  applyDecorators(
    SetMetadata(SHOPIFY_HMAC_KEY, hmacType),
    UseGuards(ShopifyHmacGuard)
  );
