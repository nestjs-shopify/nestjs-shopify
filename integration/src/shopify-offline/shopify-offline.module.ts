import { ShopifyAuthModule } from '@rh-nestjs-shopify/auth';
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
