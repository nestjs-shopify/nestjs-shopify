import { Global, Module } from '@nestjs/common';
import { ShopifyCoreModule } from '../core.module';
import { ShopifyHmacGuard } from './hmac.guard';

@Global()
@Module({
  imports: [ShopifyCoreModule],
  providers: [ShopifyHmacGuard],
})
export class ShopifyHmacModule {}
