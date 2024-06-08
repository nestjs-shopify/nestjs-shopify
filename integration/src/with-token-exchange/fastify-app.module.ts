import { Module } from '@nestjs/common';
import { FastifyInitializerModule } from '../shopify-initializer/fastify-initializer.module';
import { ShopifyTokenExchangeModule } from '../shopify-token-exchange/shopify-token-exchange.module';
import { HybridController } from '../with-hybrid-auth/hybrid.controller';

@Module({
  imports: [FastifyInitializerModule, ShopifyTokenExchangeModule],
  controllers: [HybridController],
})
export class FastifyAppModule {}
