import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { SHOPIFY_OFFLINE_AUTH_OPTIONS } from './offline-auth.constants';

@Controller('shopify/offline')
export class ShopifyAuthOfflineController extends ShopifyAuthBaseController {
  constructor(
    @Inject(SHOPIFY_OFFLINE_AUTH_OPTIONS)
    override readonly options: ShopifyAuthModuleOptions,
    override readonly appConfig: ApplicationConfig
  ) {
    super(AccessMode.Offline, options, appConfig);
  }
}
