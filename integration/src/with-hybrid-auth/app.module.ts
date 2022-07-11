import { Module } from '@nestjs/common';
import { ShopifyInitializerModule } from '../shopify-initializer/shopify-initializer.module';
import { ShopifyOfflineModule } from '../shopify-offline/shopify-offline.module';
import { ShopifyOnlineModule } from '../shopify-online/shopify-online.module';

@Module({
  imports: [
    ShopifyInitializerModule,
    ShopifyOnlineModule,
    ShopifyOfflineModule,
  ],
})
export class AppModule {}
