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

@Controller('shopify/offline')
export class ShopifyAuthOfflineController extends ShopifyAuthBaseController {
  constructor(
    @InjectShopify() shopifyApi: Shopify,
    @Inject(getAuthorizationCodeFlowOptionsToken(AccessMode.Offline))
    options: ShopifyAuthorizationCodeAuthModuleOptions,
    @InjectShopifySessionStorage() sessionStorage: SessionStorage,
    appConfig: ApplicationConfig,
    shopifyHttpAdapter: ShopifyHttpAdapter,
  ) {
    super(
      shopifyApi,
      AccessMode.Offline,
      options,
      appConfig,
      sessionStorage,
      shopifyHttpAdapter,
    );
  }
}
