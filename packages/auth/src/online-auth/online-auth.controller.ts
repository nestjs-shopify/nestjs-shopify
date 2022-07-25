import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { SHOPIFY_ONLINE_AUTH_OPTIONS } from './online-auth.constants';

@Controller('shopify/online')
export class ShopifyAuthOnlineController extends ShopifyAuthBaseController {
  constructor(
    @Inject(SHOPIFY_ONLINE_AUTH_OPTIONS)
    override readonly options: ShopifyAuthModuleOptions,
    override readonly appConfig: ApplicationConfig
  ) {
    super(AccessMode.Online, options, appConfig);
  }
}
