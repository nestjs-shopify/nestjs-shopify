import { AccessMode, ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthModule.register(AccessMode.Offline, {
      basePath: 'offline',
      useGlobalPrefix: true,
    }),
  ],
  exports: [ShopifyAuthModule],
})
export class ShopifyOfflineModule {}
