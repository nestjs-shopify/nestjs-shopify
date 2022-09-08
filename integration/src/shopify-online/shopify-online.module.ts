import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthModule.forRootOnline({
      basePath: 'online',
      returnHeaders: true,
      useGlobalPrefix: true,
    }),
  ],
})
export class ShopifyOnlineModule {}
