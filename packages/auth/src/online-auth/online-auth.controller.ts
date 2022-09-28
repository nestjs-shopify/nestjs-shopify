import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { getOptionsToken } from '../auth.constants';
import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import { Shopify } from '@shopify/shopify-api';

@Controller('shopify/online')
export class ShopifyAuthOnlineController extends ShopifyAuthBaseController {
  constructor(
    @Inject(SHOPIFY_API_CONTEXT) override readonly shopifyApi: Shopify,
    @Inject(getOptionsToken(AccessMode.Online))
    override readonly options: ShopifyAuthModuleOptions,
    override readonly appConfig: ApplicationConfig
  ) {
    super(shopifyApi, AccessMode.Online, options, appConfig);
  }
}
