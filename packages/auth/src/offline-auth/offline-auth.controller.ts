import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import {
  InjectShopify,
  InjectShopifySessionStorage,
  SessionStorage,
  ShopifyFactory,
} from '@rh-nestjs-shopify/core';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { getOptionsToken } from '../auth.constants';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';

@Controller('shopify/offline')
export class ShopifyAuthOfflineController extends ShopifyAuthBaseController {
  constructor(
    @InjectShopify() shopifyFactory: ShopifyFactory,
    @Inject(getOptionsToken(AccessMode.Offline))
    options: ShopifyAuthModuleOptions,
    @InjectShopifySessionStorage() sessionStorage: SessionStorage,
    appConfig: ApplicationConfig,
  ) {
    super(
      shopifyFactory,
      AccessMode.Offline,
      options,
      appConfig,
      sessionStorage,
    );
  }
}
