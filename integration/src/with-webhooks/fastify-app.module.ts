import { Module } from '@nestjs/common';
import { ShopifyWebhooksModule } from '@nestjs-shopify/webhooks';
import { FastifyInitializerModule } from '../shopify-initializer/fastify-initializer.module';
import { handlers } from './handlers';

@Module({
  imports: [
    FastifyInitializerModule,
    ShopifyWebhooksModule.forRootAsync({
      useFactory: () => ({
        path: 'webhooks',
      }),
    }),
  ],
  providers: [...handlers],
})
export class FastifyAppModule {}
