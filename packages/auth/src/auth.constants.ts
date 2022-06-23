import { AccessMode } from './auth.interfaces';

export const AUTH_MODE_KEY = 'shopify:authMode';

export const SHOPIFY_ACCESS_MODE = 'SHOPIFY_ACCESS_MODE';
export const SHOPIFY_AUTH_OPTIONS = 'SHOPIFY_AUTH_OPTIONS';
export const SHOPIFY_AUTH_CONTROLLER_HACK = 'SHOPIFY_AUTH_CONTROLLER_HACK';

export const SHOPIFY_AUTH_ONLINE = 'SHOPIFY_AUTH_ONLINE';
export const SHOPIFY_AUTH_OFFLINE = 'SHOPIFY_AUTH_OFFLINE';

export const SHOPIFY_AUTH_ONLINE_CONTROLLER_HACK =
  'SHOPIFY_AUTH_ONLINE_CONTROLLER_HACK';
export const SHOPIFY_AUTH_OFFLINE_CONTROLLER_HACK =
  'SHOPIFY_AUTH_OFFLINE_CONTROLLER_HACK';

export const getShopifyAuthProviderToken = (accessMode: AccessMode) => {
  return accessMode !== AccessMode.Offline
    ? SHOPIFY_AUTH_ONLINE
    : SHOPIFY_AUTH_OFFLINE;
};

export const getShopifyAuthControllerHackToken = (accessMode: AccessMode) => {
  return accessMode !== AccessMode.Offline
    ? SHOPIFY_AUTH_ONLINE_CONTROLLER_HACK
    : SHOPIFY_AUTH_OFFLINE_CONTROLLER_HACK;
};
