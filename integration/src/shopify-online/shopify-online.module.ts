import { AccessMode, ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    ShopifyAuthModule.forRoot(AccessMode.Online, {
      basePath: 'online',
      useGlobalPrefix: true,
    }),
  ],
})
export class ShopifyOnlineModule {}
