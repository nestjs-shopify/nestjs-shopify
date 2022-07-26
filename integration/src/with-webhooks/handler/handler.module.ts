import { Module } from '@nestjs/common';
import { ShopifyWebhooksHandlerService } from './shopify-webhooks-handler.service';

@Module({
  providers: [ShopifyWebhooksHandlerService],
  exports: [ShopifyWebhooksHandlerService],
})
export class HandlerModule {}
