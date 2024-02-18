import { Module } from '@nestjs/common';
import { ExpressInitializerModule } from '../shopify-initializer/express-initializer.module';
import { ShopifyOfflineModule } from '../shopify-offline/shopify-offline.module';
import { ShopifyOnlineModule } from '../shopify-online/shopify-online.module';
import { HybridController } from './hybrid.controller';

@Module({
  imports: [
    ExpressInitializerModule,
    ShopifyOfflineModule,
    ShopifyOnlineModule,
  ],
  controllers: [HybridController],
})
export class ExpressAppModule {}
