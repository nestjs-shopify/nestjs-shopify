import { AccessMode } from './auth.interfaces';

export const ACCESS_MODE_KEY = 'shopify:accessMode';

export const getOptionsToken = (mode: AccessMode) =>
  `ShopifyAuthModuleOptions(${mode})`;
