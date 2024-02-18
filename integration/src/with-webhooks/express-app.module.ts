import { Module } from '@nestjs/common';
import { ShopifyWebhooksModule } from '@nestjs-shopify/webhooks';
import { ExpressInitializerModule } from '../shopify-initializer/express-initializer.module';
import { handlers } from './handlers';

@Module({
  imports: [
    ExpressInitializerModule,
    ShopifyWebhooksModule.forRootAsync({
      useFactory: () => ({
        path: 'webhooks',
      }),
    }),
  ],
  providers: [...handlers],
})
export class ExpressAppModule {}
