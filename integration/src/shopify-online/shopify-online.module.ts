import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthModule.forRootOnline({
      basePath: 'online',
      useGlobalPrefix: true,
    }),
  ],
})
export class ShopifyOnlineModule {}
