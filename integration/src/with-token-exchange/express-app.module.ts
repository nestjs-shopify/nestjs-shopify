import { Module } from '@nestjs/common';
import { ExpressInitializerModule } from '../shopify-initializer/express-initializer.module';
import { ShopifyTokenExchangeModule } from '../shopify-token-exchange/shopify-token-exchange.module';
import { HybridController } from '../with-hybrid-auth/hybrid.controller';

@Module({
  imports: [ExpressInitializerModule, ShopifyTokenExchangeModule],
  controllers: [HybridController],
})
export class ExpressAppModule {}
