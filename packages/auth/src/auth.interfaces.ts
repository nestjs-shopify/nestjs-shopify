import { ExecutionContext, ModuleMetadata, Type } from '@nestjs/common';
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

export interface ShopifyAuthModuleTokenExchangeOptions {
  returnHeaders?: boolean;
  afterAuthHandler?: ShopifyAuthTokenExchangeAfterHandler;
}

export interface ShopifyAuthOptionsFactory<Options> {
  createShopifyAuthOptions(): Promise<Options> | Options;
}

export type ShopifySessionRequest<T> = T & {
  shopifySession?: Session | undefined;
};

export interface ShopifyAuthAfterHandler<
  T extends IncomingMessage = IncomingMessage,
  R extends ServerResponse = ServerResponse,
> {
  afterAuth(req: T, res: R, session: Session): Promise<void>;
}

export interface ShopifyAuthTokenExchangeAfterHandlerParams {
  session: Session;
  sessionToken: string;
}
export interface ShopifyAuthTokenExchangeAfterHandler {
  afterAuth(
    params: ShopifyAuthTokenExchangeAfterHandlerParams
  ): Promise<void>;
}

export interface GenericShopifyAuthModuleAsyncOptions<Options>
  extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<ShopifyAuthOptionsFactory<Options>>;
  useClass?: Type<ShopifyAuthOptionsFactory<Options>>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  useFactory?: (...args: any[]) => Promise<Options> | Options;
  inject?: any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
export type ShopifyAuthModuleAsyncOptions =
  GenericShopifyAuthModuleAsyncOptions<ShopifyAuthModuleOptions>;
export type ShopifyAuthModuleTokenExchangeAsyncOptions =
  GenericShopifyAuthModuleAsyncOptions<ShopifyAuthModuleTokenExchangeOptions>;

export interface ShopifyAuthStrategyService {
  authenticate(
    context: ExecutionContext,
    shop: string,
    accessMode: AccessMode,
  ): Promise<Session> | void;
}
