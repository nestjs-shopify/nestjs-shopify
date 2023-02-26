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

@Controller('shopify/online')
export class ShopifyAuthOnlineController extends ShopifyAuthBaseController {
  constructor(
    @InjectShopify() override readonly shopifyApi: Shopify,
    @Inject(getOptionsToken(AccessMode.Online))
    override readonly options: ShopifyAuthModuleOptions,
    override readonly appConfig: ApplicationConfig,
    @InjectShopifySessionStorage()
    override readonly sessionStorage: SessionStorage
  ) {
    super(shopifyApi, AccessMode.Online, options, appConfig, sessionStorage);
  }
}
