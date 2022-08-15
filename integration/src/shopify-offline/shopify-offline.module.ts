import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthModule.forRootOffline({
      basePath: 'offline',
      useGlobalPrefix: true,
    }),
  ],
})
export class ShopifyOfflineModule {}
