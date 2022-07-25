import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ShopifyAuthBaseGuard } from '../auth-base.guard';
import { ShopifyAuthModuleOptions } from '../auth.interfaces';
import { SHOPIFY_ONLINE_AUTH_OPTIONS } from './online-auth.constants';

@Injectable()
export class ShopifyAuthOnlineGuard extends ShopifyAuthBaseGuard {
  constructor(
    reflector: Reflector,
    @Inject(SHOPIFY_ONLINE_AUTH_OPTIONS) options: ShopifyAuthModuleOptions
  ) {
    super(reflector, options);
  }
}
