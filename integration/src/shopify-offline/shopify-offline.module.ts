import { ShopifyAuthOfflineModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthOfflineModule.forRoot({
      basePath: 'offline',
      useGlobalPrefix: true,
    }),
  ],
  exports: [ShopifyAuthOfflineModule],
})
export class ShopifyOfflineModule {}
