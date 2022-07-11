import { AccessMode, ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthModule.forRoot(AccessMode.Offline, {
      basePath: 'offline',
      useGlobalPrefix: true,
    }),
  ],
  exports: [ShopifyAuthModule],
})
export class ShopifyOfflineModule {}
