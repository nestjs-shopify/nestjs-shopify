import { Module } from '@nestjs/common';
import { ShopifyWebhooksModule } from '@nestjs-shopify/webhooks';
import { ShopifyWebhooksHandlerService } from './handler/shopify-webhooks-handler.service';
import { HandlerModule } from './handler/handler.module';
import { ShopifyInitializerModule } from '../shopify-initializer/shopify-initializer.module';

@Module({
  imports: [
    ShopifyInitializerModule,
    ShopifyWebhooksModule.forRootAsync({
      imports: [HandlerModule],
      useFactory: (handler) => ({
        handler,
        path: 'webhooks',
        topics: ['PRODUCTS_CREATE'],
      }),
      inject: [ShopifyWebhooksHandlerService],
    }),
  ],
})
export class AppModule {}
