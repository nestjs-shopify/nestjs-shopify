import { AccessMode } from './auth.interfaces';

export const AUTH_MODE_KEY = 'shopify:authMode';

export const getOptionsToken = (mode: AccessMode) =>
  `ShopifyAuthModuleOptions(${mode})`;
