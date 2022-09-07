import { Global, Module } from '@nestjs/common';
import { ShopifyHmacGuard } from './hmac.guard';

@Global()
@Module({
  providers: [ShopifyHmacGuard],
})
export class ShopifyHmacModule {}
