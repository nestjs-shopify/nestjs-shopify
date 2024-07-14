import { AccessMode } from './auth.interfaces';

export const ACCESS_MODE_KEY = 'shopify:accessMode';

export const AUTH_STRATEGY_SERVICE_TOKEN = 'ShopifyAuthStrategyService';

export const getAuthOptionsToken = (mode: AccessMode) =>
  `ShopifyAuthModuleOptions(${mode})`;
