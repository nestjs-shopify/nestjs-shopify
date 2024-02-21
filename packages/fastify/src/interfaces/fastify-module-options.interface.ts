import { ShopifyCoreOptions } from '@nestjs-shopify/core';
import { ASYNC_OPTIONS_TYPE } from '../fastify.module-builder';

export type ShopifyFastifyModuleOptions = Omit<
  ShopifyCoreOptions,
  'httpAdapter'
>;

export type ShopifyFastifyModuleAsyncOptions = typeof ASYNC_OPTIONS_TYPE;
