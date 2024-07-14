import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';
import { MyAfterAuthHandler } from './my-after-auth-handler';
import { MyAuthModule } from './my-auth.module';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncOnline(
      {
        imports: [MyAuthModule],
        useFactory: (myAuthHandler: MyAfterAuthHandler) => ({
          returnHeaders: true,
          afterAuthHandler: myAuthHandler,
        }),
        inject: [MyAfterAuthHandler],
      },
      'TOKEN_EXCHANGE',
    ),
    ShopifyAuthModule.forRootAsyncOffline(
      {
        imports: [MyAuthModule],
        useFactory: (myAuthHandler: MyAfterAuthHandler) => ({
          returnHeaders: true,
          afterAuthHandler: myAuthHandler,
        }),
        inject: [MyAfterAuthHandler],
      },
      'TOKEN_EXCHANGE',
    ),
  ],
})
export class ShopifyTokenExchangeModule {}
