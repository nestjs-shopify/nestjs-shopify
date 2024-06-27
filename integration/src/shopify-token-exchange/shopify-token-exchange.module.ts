import { ShopifyAuthModule } from '@nestjs-shopify/auth';
import { Module } from '@nestjs/common';
import { MyAfterAuthHandler } from './my-after-auth-handler';
import { MyAuthModule } from './my-auth.module';

@Module({
  imports: [
    ShopifyAuthModule.forRootAsyncTokenExchange({
      imports: [MyAuthModule],
      useFactory: (myAuthHandler) => ({
        returnHeaders: true,
        afterAuthHandler: myAuthHandler,
      }),
      inject: [MyAfterAuthHandler],
    }),
  ],
})
export class ShopifyTokenExchangeModule {}
