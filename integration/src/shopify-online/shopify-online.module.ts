import { ShopifyAuthOnlineModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthOnlineModule.register({
      basePath: 'online',
      useGlobalPrefix: true,
    }),
  ],
  exports: [ShopifyAuthOnlineModule],
})
export class ShopifyOnlineModule {}
