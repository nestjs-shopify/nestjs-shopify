import { AccessMode } from './auth.interfaces';

export const ACCESS_MODE_KEY = 'shopify:accessMode';

export const TOKEN_EXCHANGE_OPTIONS_TOKEN =
  'ShopifyAuthModuleTokenExchangeOptions';

export const AUTH_STRATEGY_SERVICE_TOKEN = 'ShopifyAuthStrategyService';

export const getOptionsToken = (mode: AccessMode) =>
  `ShopifyAuthModuleOptions(${mode})`;
