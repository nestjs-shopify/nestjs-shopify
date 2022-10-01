import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';
import { ShopifyInitializerModule } from '../shopify-initializer/shopify-initializer.module';
import { ShopifyOfflineModule } from '../shopify-offline/shopify-offline.module';
import { ShopifyOnlineModule } from '../shopify-online/shopify-online.module';
import { HybridController } from './hybrid.controller';

@Module({
  imports: [
    ShopifyInitializerModule,
    ShopifyOfflineModule,
    ShopifyOnlineModule,
    ShopifyAuthModule.register(),
  ],
  controllers: [HybridController],
})
export class AppModule {}
