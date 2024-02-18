import { ShopifyCoreOptions } from '@nestjs-shopify/core';
import { Logger } from '@nestjs/common';
import { ApiVersion, LogSeverity } from '@shopify/shopify-api';

const logger = new Logger('Shopify API');

export const SHARED_SHOPIFY_INITIALIZER_OPTIONS: Omit<
  ShopifyCoreOptions,
  'sessionStorage' | 'httpAdapter'
> = {
  apiKey: 'foo',
  apiSecretKey: 'bar',
  apiVersion: ApiVersion.Unstable,
  hostName: 'localhost:8082',
  hostScheme: 'https' as const,
  isEmbeddedApp: true,
  isCustomStoreApp: false,
  scopes: ['write_products'],
  logger: {
    log: async (_severity, msg) => logger.log(msg),
    httpRequests: false,
    level: LogSeverity.Error,
    timestamps: false,
  },
};
