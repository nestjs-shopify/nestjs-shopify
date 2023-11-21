import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import {
  InjectShopify,
  InjectShopifySessionStorage,
  SessionStorage,
} from '@rh-nestjs-shopify/core';
import { ShopifyFactory } from '../../../core/src/shopify-factory';
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
    appConfig: ApplicationConfig
  ) {
    super(
      shopifyFactory,
      AccessMode.Online,
      options,
      appConfig,
      sessionStorage
    );
  }
}
