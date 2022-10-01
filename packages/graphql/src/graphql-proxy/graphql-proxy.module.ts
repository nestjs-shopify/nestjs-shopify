import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';
import { ShopifyGraphqlProxyController } from './graphql-proxy.controller';

@Module({
  imports: [ShopifyAuthModule.register()],
  controllers: [ShopifyGraphqlProxyController],
})
export class ShopifyGraphqlProxyModule {}
