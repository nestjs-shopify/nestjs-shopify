import { ConfigParams, ShopifyRestResources } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/lib/auth/scopes';
import { SessionStorage as ShopifySessionStorage } from '@shopify/shopify-app-session-storage';
import { ASYNC_OPTIONS_TYPE } from './core.module-builder';

export type SessionStorage = ShopifySessionStorage;

export type MultiScopes = {
  key: 'DEFAULT' | string;
  scopes: string[] | AuthScopes;
};

export interface ShopifyCoreOptions<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ShopifyRestResources = any,
> extends ConfigParams<T> {
  sessionStorage: SessionStorage;
  multiScopes?: MultiScopes[];
  prefix?: ':scope' | string;
}

export type ShopifyCoreAsyncOptions = typeof ASYNC_OPTIONS_TYPE;
