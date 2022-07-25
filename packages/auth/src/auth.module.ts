import { DynamicModule, Module } from '@nestjs/common';
import {
  AccessMode,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthModuleOptions,
} from './auth.interfaces';
import { ShopifyAuthOfflineModule } from './offline-auth/offline-auth.module';
import { ShopifyAuthOnlineModule } from './online-auth/online-auth.module';

@Module({})
export class ShopifyAuthModule {
  static register(
    mode: AccessMode,
    options: ShopifyAuthModuleOptions
  ): DynamicModule {
    switch (mode) {
      case AccessMode.Offline:
        return {
          module: ShopifyAuthModule,
          imports: [ShopifyAuthOfflineModule.register(options)],
          exports: [ShopifyAuthOfflineModule],
        };
      case AccessMode.Online:
        return {
          module: ShopifyAuthModule,
          imports: [ShopifyAuthOnlineModule.register(options)],
          exports: [ShopifyAuthOnlineModule],
        };
    }
  }

  static registerAsync(
    mode: AccessMode,
    options: ShopifyAuthModuleAsyncOptions
  ): DynamicModule {
    switch (mode) {
      case AccessMode.Offline:
        return {
          module: ShopifyAuthModule,
          imports: [ShopifyAuthOfflineModule.registerAsync(options)],
          exports: [ShopifyAuthOfflineModule],
        };
      case AccessMode.Online:
        return {
          module: ShopifyAuthModule,
          imports: [ShopifyAuthOnlineModule.registerAsync(options)],
          exports: [ShopifyAuthOnlineModule],
        };
    }
  }
}
