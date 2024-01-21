import { Global, Module } from '@nestjs/common';
import { ShopifyHmacGuard } from './hmac.guard';
import { ShopifyHmacService } from './hmac.service';

@Global()
@Module({
  providers: [ShopifyHmacGuard, ShopifyHmacService],
  exports: [ShopifyHmacService],
})
export class ShopifyHmacModule {}
