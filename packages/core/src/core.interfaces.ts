import { ApiVersion } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import { SessionStorage } from '@shopify/shopify-api/dist/auth/session';
import { ASYNC_OPTIONS_TYPE } from './core.module-builder';

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

export type ShopifyCoreAsyncOptions = typeof ASYNC_OPTIONS_TYPE;
