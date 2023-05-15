import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig, HttpAdapterHost } from '@nestjs/core';
import {
  InjectShopify,
  InjectShopifySessionStorage,
  SessionStorage,
} from '@nestjs-shopify/core';
import { Shopify } from '@shopify/shopify-api';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { getOptionsToken } from '../auth.constants';

@Controller('shopify/offline')
export class ShopifyAuthOfflineController extends ShopifyAuthBaseController {
  constructor(
    @InjectShopify() shopifyApi: Shopify,
    @Inject(getOptionsToken(AccessMode.Offline))
    options: ShopifyAuthModuleOptions,
    @InjectShopifySessionStorage() sessionStorage: SessionStorage,
    appConfig: ApplicationConfig,
    adapterHost: HttpAdapterHost
  ) {
    super(
      shopifyApi,
      AccessMode.Offline,
      options,
      appConfig,
      sessionStorage,
      adapterHost
    );
  }
}
