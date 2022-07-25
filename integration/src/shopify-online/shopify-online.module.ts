import { AccessMode, ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthModule.register(AccessMode.Online, {
      basePath: 'online',
      useGlobalPrefix: true,
    }),
  ],
  exports: [ShopifyAuthModule],
})
export class ShopifyOnlineModule {}
