import { DynamicModule } from '@nestjs/common';
import { getOptionsToken } from './auth.constants';
import {
  AccessMode,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthModuleOptions,
} from './auth.interfaces';
import { ShopifyAuthOfflineController } from './offline-auth/offline-auth.controller';
import { ShopifyAuthOnlineController } from './online-auth/online-auth.controller';
import { buildControllerHackForToken } from './utils/build-controller-hack-for-token.util';
import { buildProvidersForToken } from './utils/build-provider-for-token.util';

export class ShopifyAuthModule {
  static forRootOnline(options: ShopifyAuthModuleOptions): DynamicModule {
    return {
      module: class ShopifyAuthOnlineModule {},
      global: true,
      providers: [
        {
          provide: getOptionsToken(AccessMode.Online),
          useValue: options,
        },
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Online),
          ShopifyAuthOnlineController
        ),
      ],
      controllers: [ShopifyAuthOnlineController],
    };
  }

  static forRootOffline(options: ShopifyAuthModuleOptions): DynamicModule {
    return {
      module: class ShopifyAuthOfflineModule {},
      global: true,
      providers: [
        {
          provide: getOptionsToken(AccessMode.Offline),
          useValue: options,
        },
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Offline),
          ShopifyAuthOfflineController
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
    };
  }

  static forRootAsyncOnline(
    options: ShopifyAuthModuleAsyncOptions
  ): DynamicModule {
    return {
      module: class ShopifyAuthOnlineModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        ...buildProvidersForToken(options, getOptionsToken(AccessMode.Online)),
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Online),
          ShopifyAuthOnlineController
        ),
      ],
      controllers: [ShopifyAuthOnlineController],
    };
  }

  static forRootAsyncOffline(
    options: ShopifyAuthModuleAsyncOptions
  ): DynamicModule {
    return {
      module: class ShopifyAuthOfflineModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        ...buildProvidersForToken(options, getOptionsToken(AccessMode.Offline)),
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Offline),
          ShopifyAuthOfflineController
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
    };
  }
}
