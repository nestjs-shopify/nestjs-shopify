import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
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
    @InjectShopify() override readonly shopifyApi: Shopify,
    @Inject(getOptionsToken(AccessMode.Offline))
    override readonly options: ShopifyAuthModuleOptions,
    override readonly appConfig: ApplicationConfig,
    @InjectShopifySessionStorage()
    override readonly sessionStorage: SessionStorage
  ) {
    super(shopifyApi, AccessMode.Offline, options, appConfig, sessionStorage);
  }
}
