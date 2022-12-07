import { Scope } from '@nestjs/common';
import { ASYNC_OPTIONS_TYPE } from './webhooks.module-builder';

export interface ShopifyWebhooksOptions {
  path?: string;
}

export interface ShopifyWebhookHandlerOptions {
  topic: string;
  scope?: Scope;
}

export abstract class ShopifyWebhookHandler<T = unknown> {
  abstract handle(shop: string, data: T, webhookId?: string): Promise<void>;
}

export type ShopifyWebhooksAsyncOptions = typeof ASYNC_OPTIONS_TYPE;
