import { Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Shopify from '@shopify/shopify-api';
import { ShopifyCoreOptions } from './core.interfaces';
import {
  ConfigurableModuleClass,
  SHOPIFY_CORE_OPTIONS,
} from './core.module-builder';

@Module({
  exports: [SHOPIFY_CORE_OPTIONS],
})
export class ShopifyCoreModule
  extends ConfigurableModuleClass
  implements OnModuleInit
{
  constructor(private moduleRef: ModuleRef) {
    super();
  }

  onModuleInit() {
    const options = this.moduleRef.get<string, ShopifyCoreOptions>(
      SHOPIFY_CORE_OPTIONS
    );

    Shopify.Context.initialize({
      API_KEY: options.apiKey,
      API_SECRET_KEY: options.apiSecret,
      API_VERSION: options.apiVersion,
      SCOPES: options.scopes,
      HOST_NAME: options.hostName,
      IS_EMBEDDED_APP: options.isEmbeddedApp,
      SESSION_STORAGE: options.sessionStorage,
    });
  }
}
