import { ShopifyAuthOfflineModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthOfflineModule.register({
      basePath: 'offline',
      useGlobalPrefix: true,
    }),
  ],
  exports: [ShopifyAuthOfflineModule],
})
export class ShopifyOfflineModule {}
