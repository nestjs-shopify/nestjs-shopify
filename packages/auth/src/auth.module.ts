import { DynamicModule, Module } from '@nestjs/common';
import {
  AccessMode,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthModuleOptions,
} from './auth.interfaces';
import { ShopifyAuthCoreModule } from './auth-core.module';

@Module({})
export class ShopifyAuthModule {
  static forRoot(
    mode: AccessMode,
    options: ShopifyAuthModuleOptions
  ): DynamicModule {
    return {
      module: ShopifyAuthModule,
      imports: [ShopifyAuthCoreModule.forRoot(mode, options)],
    };
  }

  static forRootAsync(
    mode: AccessMode,
    options: ShopifyAuthModuleAsyncOptions
  ): DynamicModule {
    return {
      module: ShopifyAuthModule,
      imports: [ShopifyAuthCoreModule.forRootAsync(mode, options)],
    };
  }
}
