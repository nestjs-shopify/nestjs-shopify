import { Module } from '@nestjs/common';
import { ShopifyInitializerModule } from '../shopify-initializer/shopify-initializer.module';
import { ShopifyOnlineModule } from '../shopify-online/shopify-online.module';

@Module({
  imports: [ShopifyInitializerModule, ShopifyOnlineModule],
})
export class AppModule {}
