import { Module } from '@nestjs/common';
import { MyAfterAuthHandler } from './my-after-auth-handler';

@Module({
  providers: [MyAfterAuthHandler],
  exports: [MyAfterAuthHandler],
})
export class MyAuthModule {}
