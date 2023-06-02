import { Module } from '@nestjs/common';
import { ShopifyWebhooksModule } from '@rh-nestjs-shopify/webhooks';
import { ShopifyInitializerModule } from '../shopify-initializer/shopify-initializer.module';
import { handlers } from './handlers';

@Module({
  imports: [
    ShopifyInitializerModule,
    ShopifyWebhooksModule.forRootAsync({
      useFactory: () => ({
        path: 'webhooks',
      }),
    }),
  ],
  providers: [...handlers],
})
export class AppModule {}
