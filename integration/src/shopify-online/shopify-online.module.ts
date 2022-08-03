import { ShopifyAuthOnlineModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthOnlineModule.forRoot({
      basePath: 'online',
      useGlobalPrefix: true,
    }),
  ],
  exports: [ShopifyAuthOnlineModule],
})
export class ShopifyOnlineModule {}
