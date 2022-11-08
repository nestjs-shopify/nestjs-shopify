import { Module } from '@nestjs/common';
import { MemorySessionStorage } from './memory.session-storage';

@Module({
  providers: [MemorySessionStorage],
  exports: [MemorySessionStorage],
})
export class MemorySessionStorageModule {}
