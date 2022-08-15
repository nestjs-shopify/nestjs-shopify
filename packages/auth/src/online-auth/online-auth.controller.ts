import { Controller, Inject } from '@nestjs/common';
import { ApplicationConfig } from '@nestjs/core';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { getOptionsToken } from '../auth.constants';

@Controller('shopify/online')
export class ShopifyAuthOnlineController extends ShopifyAuthBaseController {
  constructor(
    @Inject(getOptionsToken(AccessMode.Online))
    override readonly options: ShopifyAuthModuleOptions,
    override readonly appConfig: ApplicationConfig
  ) {
    super(AccessMode.Online, options, appConfig);
  }
}
