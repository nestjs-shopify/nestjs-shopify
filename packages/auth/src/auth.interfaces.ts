import { ExecutionContext, ModuleMetadata, Type } from '@nestjs/common';
import type { Session } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';

export enum AccessMode {
  Online = 'online',
  Offline = 'offline',
}

export type ShopifyAuthorizationCodeAuthModuleOptions = {
  basePath?: string;
  returnHeaders?: boolean;
  useGlobalPrefix?: boolean;
  afterAuthHandler?: ShopifyAuthAfterHandler;
};

export type ShopifyTokenExchangeAuthModuleOptions = {
  returnHeaders?: boolean;
  afterAuthHandler?: ShopifyTokenExchangeAuthAfterHandler;
};

export type ShopifyAuthModuleOptions =
  | ShopifyAuthorizationCodeAuthModuleOptions
  | ShopifyTokenExchangeAuthModuleOptions;

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

export interface ShopifyTokenExchangeAuthAfterHandlerParams {
  session: Session;
  sessionToken: string;
}
export interface ShopifyTokenExchangeAuthAfterHandler {
  afterAuth(params: ShopifyTokenExchangeAuthAfterHandlerParams): Promise<void>;
}

export type AuthStrategy = 'TOKEN_EXCHANGE' | 'AUTHORIZATION_CODE_FLOW';
export type ShopifyAuthModuleAsyncOptions<
  A extends AuthStrategy,
  O = A extends 'AUTHORIZATION_CODE_FLOW'
    ? ShopifyAuthorizationCodeAuthModuleOptions
    : ShopifyTokenExchangeAuthModuleOptions,
> = Pick<ModuleMetadata, 'imports'> & {
  useExisting?: Type<ShopifyAuthOptionsFactory<O>>;
  useClass?: Type<ShopifyAuthOptionsFactory<O>>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  useFactory?: (...args: any[]) => Promise<O> | O;
  inject?: any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
};

export abstract class ShopifyAuthStrategyService {
  abstract authenticate(
    context: ExecutionContext,
    shop: string,
    accessMode: AccessMode,
  ): Promise<Session> | void;
}
