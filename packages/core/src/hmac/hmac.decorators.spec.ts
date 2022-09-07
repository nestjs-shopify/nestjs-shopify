import { Reflector } from '@nestjs/core';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { SHOPIFY_HMAC_KEY } from './hmac.constants';
import { ShopifyHmac } from './hmac.decorators';
import { ShopifyHmacType } from './hmac.enums';
import { ShopifyHmacGuard } from './hmac.guard';

describe('ShopifyHmac', () => {
  const reflector = new Reflector();

  describe.each([ShopifyHmacType.Header, ShopifyHmacType.Query])(
    'with %s hmac type',
    (hmacType) => {
      @ShopifyHmac(hmacType)
      class TargetClass {}

      it('should add hmac type to target class', () => {
        expect(reflector.get(SHOPIFY_HMAC_KEY, TargetClass)).toEqual(hmacType);
      });

      it('should add hmac guard to target class', () => {
        expect(reflector.get(GUARDS_METADATA, TargetClass)).toContain(
          ShopifyHmacGuard
        );
      });
    }
  );
});
