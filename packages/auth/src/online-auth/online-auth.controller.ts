import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import {
  InjectShopify,
  InjectShopifyCoreOptions,
  InjectShopifySessionStorage,
  SessionStorage,
  ShopifyCoreOptions,
  ShopifyFactory,
} from '@rh-nestjs-shopify/core';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { getOptionsToken } from '../auth.constants';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';

@Controller('shopify/online')
export class ShopifyAuthOnlineController extends ShopifyAuthBaseController {
  constructor(
    @InjectShopify() shopifyFactory: ShopifyFactory,
    @Inject(getOptionsToken(AccessMode.Online))
    options: ShopifyAuthModuleOptions,
    @InjectShopifySessionStorage() sessionStorage: SessionStorage,
    appConfig: ApplicationConfig,
    @InjectShopifyCoreOptions() shopifyCoreOptions: ShopifyCoreOptions,
  ) {
    super(
      shopifyFactory,
      AccessMode.Online,
      options,
      appConfig,
      sessionStorage,
      shopifyCoreOptions,
    );
  }
}
