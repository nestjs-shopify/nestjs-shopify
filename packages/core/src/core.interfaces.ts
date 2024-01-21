import { ConfigParams, ShopifyRestResources } from '@shopify/shopify-api';
import { SessionStorage as ShopifySessionStorage } from '@shopify/shopify-app-session-storage';
import { ASYNC_OPTIONS_TYPE } from './core.module-builder';

export type SessionStorage = ShopifySessionStorage;
export type SharedSecretGetter = (domain: string) => Promise<string | undefined>;

export interface ShopifyCoreOptions<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends ShopifyRestResources = any,
> extends ConfigParams<T> {
  sessionStorage: SessionStorage;
  getSharedSecret?: SharedSecretGetter;
}

export type ShopifyCoreAsyncOptions = typeof ASYNC_OPTIONS_TYPE;
