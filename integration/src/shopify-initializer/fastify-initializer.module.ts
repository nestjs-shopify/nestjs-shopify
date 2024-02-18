import { ShopifyFastifyModule } from '@nestjs-shopify/fastify';
import { Module } from '@nestjs/common';
import { MemorySessionStorageModule } from './session-storage/memory-session-storage.module';
import { MemorySessionStorage } from './session-storage/memory.session-storage';
import { SHARED_SHOPIFY_INITIALIZER_OPTIONS } from './shopify-initializer.constants';

@Module({
  imports: [
    ShopifyFastifyModule.forRootAsync({
      imports: [MemorySessionStorageModule],
      useFactory: (sessionStorage: MemorySessionStorage) => ({
        ...SHARED_SHOPIFY_INITIALIZER_OPTIONS,
        sessionStorage,
      }),
      inject: [MemorySessionStorage],
    }),
  ],
  exports: [ShopifyFastifyModule],
})
export class FastifyInitializerModule {}
