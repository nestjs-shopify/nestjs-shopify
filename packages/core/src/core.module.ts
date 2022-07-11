import { DynamicModule, Global, Module, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Shopify from '@shopify/shopify-api';
import { SHOPIFY_CORE_OPTIONS } from './core.constants';
import { ShopifyCoreAsyncOptions, ShopifyCoreOptions } from './core.interfaces';
import { createShopifyCoreAsyncOptionsProviders } from './core.providers';

@Global()
@Module({})
export class ShopifyCoreModule implements OnModuleInit {
  static async forRoot(options: ShopifyCoreOptions): Promise<DynamicModule> {
    return {
      module: ShopifyCoreModule,
      global: true,
      providers: [{ provide: SHOPIFY_CORE_OPTIONS, useValue: options }],
      exports: [SHOPIFY_CORE_OPTIONS],
    };
  }

  static async forRootAsync(
    options: ShopifyCoreAsyncOptions
  ): Promise<DynamicModule> {
    return {
      module: ShopifyCoreModule,
      global: true,
      imports: options.imports || [],
      providers: [...createShopifyCoreAsyncOptionsProviders(options)],
      exports: [SHOPIFY_CORE_OPTIONS],
    };
  }

  constructor(private moduleRef: ModuleRef) {}

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
