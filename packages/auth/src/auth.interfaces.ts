import { ExecutionContext, ModuleMetadata, Type } from '@nestjs/common';
import type { Session } from '@shopify/shopify-api';
import type { IncomingMessage, ServerResponse } from 'http';

export enum AccessMode {
  Online = 'online',
  Offline = 'offline',
}

export enum AuthStrategy {
  AuthorizationCode = 'AUTHORIZATION_CODE_FLOW',
  TokenExchange = 'TOKEN_EXCHANGE',
}

export type ShopifyAuthorizationCodeAuthModuleOptions = {
  basePath?: string;
  returnHeaders?: boolean;
  useGlobalPrefix?: boolean;
  afterAuthHandler?: ShopifyAuthAfterHandler;
  /**
   * Whether to request expiring offline access tokens during OAuth.
   * Required for public apps as of Shopify's April 2026 mandate.
   * Private/custom apps should leave this as `false` (default).
   * @see https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/offline-access-tokens
   */
  useExpiringOfflineAccessTokens?: boolean;
};

export type ShopifyTokenExchangeAuthModuleOptions = {
  returnHeaders?: boolean;
  afterAuthHandler?: ShopifyTokenExchangeAuthAfterHandler;
  /**
   * Whether to request expiring offline access tokens during token exchange.
   * Required for public apps as of Shopify's April 2026 mandate.
   * Private/custom apps should leave this as `false` (default).
   * @see https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens/token-exchange
   */
  useExpiringOfflineAccessTokens?: boolean;
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

export type ShopifyAuthModuleAsyncOptions<
  A extends AuthStrategy,
  O = A extends AuthStrategy.AuthorizationCode
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
