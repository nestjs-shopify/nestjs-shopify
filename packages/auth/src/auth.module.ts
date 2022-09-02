import { DynamicModule } from '@nestjs/common';
import { ShopifyAuthSessionService } from './auth-session.service';
import { getControllerHackToken, getOptionsToken } from './auth.constants';
import { ShopifyAuthGuard } from './auth.guard';
import {
  AccessMode,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthModuleOptions,
} from './auth.interfaces';
import { ShopifyAuthOfflineController } from './offline-auth/offline-auth.controller';
import { ShopifyGraphqlController } from './online-auth/graphql.controller';
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
        ShopifyAuthGuard,
        ShopifyAuthSessionService,
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Online),
          getControllerHackToken(AccessMode.Online),
          ShopifyAuthOnlineController
        ),
      ],
      controllers: [ShopifyAuthOnlineController, ShopifyGraphqlController],
      exports: [ShopifyAuthSessionService],
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
        ShopifyAuthGuard,
        ShopifyAuthSessionService,
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Offline),
          getControllerHackToken(AccessMode.Offline),
          ShopifyAuthOfflineController
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
      exports: [ShopifyAuthSessionService],
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
        ShopifyAuthGuard,
        ShopifyAuthSessionService,
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Online),
          getControllerHackToken(AccessMode.Online),
          ShopifyAuthOnlineController
        ),
      ],
      controllers: [ShopifyAuthOnlineController, ShopifyGraphqlController],
      exports: [ShopifyAuthSessionService],
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
        ShopifyAuthGuard,
        ShopifyAuthSessionService,
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Offline),
          getControllerHackToken(AccessMode.Offline),
          ShopifyAuthOfflineController
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
      exports: [ShopifyAuthSessionService],
    };
  }
}
