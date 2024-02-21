import { ShopifyExpressModule } from '@nestjs-shopify/express';
import { Module } from '@nestjs/common';
import { MemorySessionStorageModule } from './session-storage/memory-session-storage.module';
import { MemorySessionStorage } from './session-storage/memory.session-storage';
import { SHARED_SHOPIFY_INITIALIZER_OPTIONS } from './shopify-initializer.constants';

@Module({
  imports: [
    ShopifyExpressModule.forRootAsync({
      imports: [MemorySessionStorageModule],
      useFactory: (sessionStorage: MemorySessionStorage) => ({
        ...SHARED_SHOPIFY_INITIALIZER_OPTIONS,
        sessionStorage,
      }),
      inject: [MemorySessionStorage],
    }),
  ],
  exports: [ShopifyExpressModule],
})
export class ExpressInitializerModule {}
