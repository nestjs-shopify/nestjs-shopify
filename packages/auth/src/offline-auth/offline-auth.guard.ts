import { Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ShopifyAuthBaseGuard } from '../auth-base.guard';
import { ShopifyAuthModuleOptions } from '../auth.interfaces';
import { SHOPIFY_OFFLINE_AUTH_OPTIONS } from './offline-auth.constants';

@Injectable()
export class ShopifyAuthOfflineGuard extends ShopifyAuthBaseGuard {
  constructor(
    reflector: Reflector,
    @Inject(SHOPIFY_OFFLINE_AUTH_OPTIONS) options: ShopifyAuthModuleOptions
  ) {
    super(reflector, options);
  }
}
