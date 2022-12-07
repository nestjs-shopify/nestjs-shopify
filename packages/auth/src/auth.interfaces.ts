import { ModuleMetadata, Type } from '@nestjs/common';
import type { Session } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';

export enum AccessMode {
  Online = 'online',
  Offline = 'offline',
}

export interface ShopifyAuthModuleOptions {
  basePath?: string;
  returnHeaders?: boolean;
  useGlobalPrefix?: boolean;
  afterAuthHandler?: ShopifyAuthAfterHandler;
}

export interface ShopifyAuthOptionsFactory {
  createShopifyAuthOptions():
    | Promise<ShopifyAuthModuleOptions>
    | ShopifyAuthModuleOptions;
}

export type ShopifySessionRequest<T> = T & {
  shopifySession?: Session | undefined;
};

export interface ShopifyAuthAfterHandler<
  T extends IncomingMessage = IncomingMessage,
  R extends ServerResponse = ServerResponse
> {
  afterAuth(req: T, res: R, session: Session): Promise<void>;
}

export interface ShopifyAuthModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ShopifyAuthOptionsFactory>;
  useClass?: Type<ShopifyAuthOptionsFactory>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  useFactory?: (
    ...args: any[]
  ) => Promise<ShopifyAuthModuleOptions> | ShopifyAuthModuleOptions;
  inject?: any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
