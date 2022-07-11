import { Module } from '@nestjs/common';
import { ShopifyInitializerModule } from '../shopify-initializer/shopify-initializer.module';
import { ShopifyOfflineModule } from '../shopify-offline/shopify-offline.module';

@Module({
  imports: [ShopifyInitializerModule, ShopifyOfflineModule],
})
export class AppModule {}
