import { SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { SHOPIFY_WEBHOOKS_METADATA } from './webhooks.constants';
import { ShopifyWebhookHandlerOptions } from './webhooks.interfaces';

export function WebhookHandler(topic: string): ClassDecorator;
export function WebhookHandler(
  options: ShopifyWebhookHandlerOptions
): ClassDecorator;
export function WebhookHandler(
  topicOrOptions: string | ShopifyWebhookHandlerOptions
): ClassDecorator {
  let options: ShopifyWebhookHandlerOptions;
  if (typeof topicOrOptions === 'string') {
    options = { topic: topicOrOptions };
  } else {
    options = topicOrOptions;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(SHOPIFY_WEBHOOKS_METADATA, options)(target);
  };
}
