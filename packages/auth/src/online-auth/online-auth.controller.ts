import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import {
  InjectShopify,
  InjectShopifySessionStorage,
  SessionStorage,
  ShopifyHttpAdapter,
} from '@nestjs-shopify/core';
import { Shopify } from '@shopify/shopify-api';
import {
  AccessMode,
  ShopifyAuthorizationCodeAuthModuleOptions,
} from '../auth.interfaces';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { getAuthorizationCodeFlowOptionsToken } from '../auth.constants';

@Controller('shopify/online')
export class ShopifyAuthOnlineController extends ShopifyAuthBaseController {
  constructor(
    @InjectShopify() shopifyApi: Shopify,
    @Inject(getAuthorizationCodeFlowOptionsToken(AccessMode.Online))
    options: ShopifyAuthorizationCodeAuthModuleOptions,
    @InjectShopifySessionStorage() sessionStorage: SessionStorage,
    appConfig: ApplicationConfig,
    shopifyHttpAdapter: ShopifyHttpAdapter,
  ) {
    super(
      shopifyApi,
      AccessMode.Online,
      options,
      appConfig,
      sessionStorage,
      shopifyHttpAdapter,
    );
  }
}
