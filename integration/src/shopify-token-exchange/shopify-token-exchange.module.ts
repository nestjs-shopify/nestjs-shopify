import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';
import { MyAfterAuthHandler } from './my-after-auth-handler';
import { MyAuthModule } from './my-auth.module';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncOnline({
      imports: [MyAuthModule],
      authStrategy: 'TOKEN_EXCHANGE',
      useFactory: (myAuthHandler: MyAfterAuthHandler) => ({
        returnHeaders: true,
        afterAuthHandler: myAuthHandler,
      }),
      inject: [MyAfterAuthHandler],
    }),
    ShopifyAuthModule.forRootAsyncOffline({
      imports: [MyAuthModule],
      authStrategy: 'TOKEN_EXCHANGE',
      useFactory: (myAuthHandler: MyAfterAuthHandler) => ({
        returnHeaders: true,
        afterAuthHandler: myAuthHandler,
      }),
      inject: [MyAfterAuthHandler],
    }),
  ],
})
export class ShopifyTokenExchangeModule {}
