import { Inject } from '@nestjs/common';
import {
  SHOPIFY_API_CONTEXT,
  SHOPIFY_API_SESSION_STORAGE,
} from './core.constants';

export const InjectShopify = () => Inject(SHOPIFY_API_CONTEXT);
export const InjectShopifySessionStorage = () =>
  Inject(SHOPIFY_API_SESSION_STORAGE);
