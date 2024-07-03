import { AccessMode } from './auth.interfaces';

export const ACCESS_MODE_KEY = 'shopify:accessMode';

export const AUTH_STRATEGY_SERVICE_TOKEN = 'ShopifyAuthStrategyService';

export const getAuthorizationCodeFlowOptionsToken = (mode: AccessMode) =>
  `ShopifyAuthModuleAuthorizationCodeFlowOptions(${mode})`;

export const getTokenExchangeOptionsToken = (mode: AccessMode) =>
  `ShopifyAuthModuleTokenExchangeOptions(${mode})`;
