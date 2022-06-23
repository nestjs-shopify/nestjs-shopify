import { ModuleMetadata, Type } from '@nestjs/common';
import { ApiVersion } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import { SessionStorage } from '@shopify/shopify-api/dist/auth/session';

export interface ShopifyCoreOptions {
  apiKey: string;
  apiSecret: string;
  scopes: string[] | AuthScopes;
  apiVersion: ApiVersion;
  hostName: string;
  isEmbeddedApp: boolean;
  sessionStorage?: SessionStorage;
}

export interface ShopifyCoreOptionsFactory {
  createShopifyCoreOptions(): Promise<ShopifyCoreOptions> | ShopifyCoreOptions;
}

export interface ShopifyCoreAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ShopifyCoreOptionsFactory> | undefined;
  useClass?: Type<ShopifyCoreOptionsFactory> | undefined;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  useFactory?: (
    ...args: any[]
  ) => Promise<ShopifyCoreOptions> | ShopifyCoreOptions;
  inject?: any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
