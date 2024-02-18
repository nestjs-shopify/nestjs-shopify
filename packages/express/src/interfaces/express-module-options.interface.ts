import { ShopifyCoreOptions } from '@nestjs-shopify/core';
import { ASYNC_OPTIONS_TYPE } from '../express.module-builder';

export type ShopifyExpressModuleOptions = Omit<
  ShopifyCoreOptions,
  'httpAdapter'
>;

export type ShopifyExpressModuleAsyncOptions = typeof ASYNC_OPTIONS_TYPE;
