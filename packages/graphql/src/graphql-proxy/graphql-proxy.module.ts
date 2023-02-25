import { Module } from '@nestjs/common';
import { ShopifyGraphqlProxyController } from './graphql-proxy.controller';

@Module({
  controllers: [ShopifyGraphqlProxyController],
})
export class ShopifyGraphqlProxyModule {}
