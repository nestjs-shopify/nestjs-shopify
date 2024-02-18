import { Module } from '@nestjs/common';
import { ShopifyOfflineModule } from '../shopify-offline/shopify-offline.module';
import { ShopifyOnlineModule } from '../shopify-online/shopify-online.module';
import { HybridController } from './hybrid.controller';
import { FastifyInitializerModule } from '../shopify-initializer/fastify-initializer.module';

@Module({
  imports: [
    FastifyInitializerModule,
    ShopifyOfflineModule,
    ShopifyOnlineModule,
  ],
  controllers: [HybridController],
})
export class FastifyAppModule {}
