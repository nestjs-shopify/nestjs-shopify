import { ConfigInterface, Session } from '@shopify/shopify-api';
import { ASYNC_OPTIONS_TYPE } from './core.module-builder';

export interface SessionStorage {
  getSessionById(id: string): Promise<Session | undefined>;
}

export interface ShopifyCoreOptions extends ConfigInterface {
  sessionStorage: SessionStorage;
}

export type ShopifyCoreAsyncOptions = typeof ASYNC_OPTIONS_TYPE;
