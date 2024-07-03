import { ExecutionContext, ModuleMetadata, Type } from '@nestjs/common';
import type { Session } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';

export enum AccessMode {
  Online = 'online',
  Offline = 'offline',
}

export type ShopifyAuthModuleAuthorizationCodeFlowBaseOptions = {
  basePath?: string;
  returnHeaders?: boolean;
  useGlobalPrefix?: boolean;
  afterAuthHandler?: ShopifyAuthAfterHandler;
};

export type ShopifyAuthModuleAuthorizationCodeFlowOptions =
  ShopifyAuthModuleAuthorizationCodeFlowBaseOptions & {
    authStrategy?: 'AUTHORIZATION_CODE_FLOW';
  };

export type ShopifyAuthModuleTokenExchangeBaseOptions = {
  returnHeaders?: boolean;
  afterAuthHandler?: ShopifyAuthTokenExchangeAfterHandler;
};

export type ShopifyAuthModuleTokenExchangeOptions =
  ShopifyAuthModuleTokenExchangeBaseOptions & {
    authStrategy: 'TOKEN_EXCHANGE';
  };

export type ShopifyAuthModuleOptions =
  | ShopifyAuthModuleAuthorizationCodeFlowOptions
  | ShopifyAuthModuleTokenExchangeOptions;

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
  afterAuth(params: ShopifyAuthTokenExchangeAfterHandlerParams): Promise<void>;
}

export type AuthStrategy = 'TOKEN_EXCHANGE' | 'AUTHORIZATION_CODE_FLOW';
export type ShopifyAuthModuleAsyncOptions<
  A extends AuthStrategy,
  O = A extends 'AUTHORIZATION_CODE_FLOW'
    ? ShopifyAuthModuleAuthorizationCodeFlowBaseOptions
    : ShopifyAuthModuleTokenExchangeBaseOptions,
> = Pick<ModuleMetadata, 'imports'> & {
  authStrategy?: A;
  useExisting?: Type<ShopifyAuthOptionsFactory<O>>;
  useClass?: Type<ShopifyAuthOptionsFactory<O>>;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  useFactory?: (...args: any[]) => Promise<O> | O;
  inject?: any[];
  /* eslint-enable @typescript-eslint/no-explicit-any */
};

export interface ShopifyAuthStrategyService {
  authenticate(
    context: ExecutionContext,
    shop: string,
    accessMode: AccessMode,
  ): Promise<Session> | void;
}
