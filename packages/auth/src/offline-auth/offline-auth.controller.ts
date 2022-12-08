import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { getOptionsToken } from '../auth.constants';
import {
  SHOPIFY_API_CONTEXT,
  SHOPIFY_API_SESSION_STORAGE,
} from '@nestjs-shopify/core';
import { Shopify } from '@shopify/shopify-api';
import { SessionStorage } from '@shopify/shopify-app-session-storage';

@Controller('shopify/offline')
export class ShopifyAuthOfflineController extends ShopifyAuthBaseController {
  constructor(
    @Inject(SHOPIFY_API_CONTEXT) override readonly shopifyApi: Shopify,
    @Inject(getOptionsToken(AccessMode.Offline))
    override readonly options: ShopifyAuthModuleOptions,
    override readonly appConfig: ApplicationConfig,
    @Inject(SHOPIFY_API_SESSION_STORAGE)
    override readonly sessionStorage: SessionStorage
  ) {
    super(shopifyApi, AccessMode.Offline, options, appConfig, sessionStorage);
  }
}
