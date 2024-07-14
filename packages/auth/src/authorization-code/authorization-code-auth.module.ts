import { DynamicModule } from '@nestjs/common';
import { getAuthOptionsToken } from '../auth.constants';
import {
  AccessMode,
  AuthStrategy,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthStrategyService,
} from '../auth.interfaces';
import { ShopifyAuthorizationCodeAuthModuleOptions } from '../auth.interfaces';
import { ShopifyAuthOnlineController } from '../online-auth/online-auth.controller';
import { buildControllerHackForToken } from '../utils/build-controller-hack-for-token.util';
import { ShopifyAuthOfflineController } from '../offline-auth/offline-auth.controller';
import { buildProvidersForToken } from '../utils/build-provider-for-token.util';
import { ShopifyAuthorizationCodeAuthStrategyService } from './authorization-code-auth-strategy.service';

export class ShopifyAuthorizationCodeAuthModule {
  static forRootOnline(
    options: ShopifyAuthorizationCodeAuthModuleOptions,
  ): DynamicModule {
    return {
      module: class ShopifyAuthorizationCodeAuthOnlineModule {},
      global: true,
      providers: [
        {
          provide: getAuthOptionsToken(AccessMode.Online),
          useValue: options,
        },
        {
          provide: ShopifyAuthStrategyService,
          useClass: ShopifyAuthorizationCodeAuthStrategyService,
        },
        buildControllerHackForToken(
          getAuthOptionsToken(AccessMode.Online),
          ShopifyAuthOnlineController,
        ),
      ],
      controllers: [ShopifyAuthOnlineController],
      exports: [ShopifyAuthStrategyService],
    };
  }

  static forRootOffline(
    options: ShopifyAuthorizationCodeAuthModuleOptions,
  ): DynamicModule {
    return {
      module: class ShopifyAuthorizationCodeAuthOfflineModule {},
      global: true,
      providers: [
        {
          provide: getAuthOptionsToken(AccessMode.Offline),
          useValue: options,
        },
        {
          provide: ShopifyAuthStrategyService,
          useClass: ShopifyAuthorizationCodeAuthStrategyService,
        },
        buildControllerHackForToken(
          getAuthOptionsToken(AccessMode.Offline),
          ShopifyAuthOfflineController,
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
      exports: [ShopifyAuthStrategyService],
    };
  }

  static forRootAsyncOnline(
    options: ShopifyAuthModuleAsyncOptions<
      AuthStrategy.AuthorizationCode,
      ShopifyAuthorizationCodeAuthModuleOptions
    >,
  ): DynamicModule {
    return {
      module: class ShopifyAuthorizationCodeAuthOnlineModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: ShopifyAuthStrategyService,
          useClass: ShopifyAuthorizationCodeAuthStrategyService,
        },
        ...buildProvidersForToken(
          options,
          getAuthOptionsToken(AccessMode.Online),
        ),
        buildControllerHackForToken(
          getAuthOptionsToken(AccessMode.Online),
          ShopifyAuthOnlineController,
        ),
      ],
      controllers: [ShopifyAuthOnlineController],
      exports: [ShopifyAuthStrategyService],
    };
  }

  static forRootAsyncOffline(
    options: ShopifyAuthModuleAsyncOptions<
      AuthStrategy.AuthorizationCode,
      ShopifyAuthorizationCodeAuthModuleOptions
    >,
  ): DynamicModule {
    return {
      module: class ShopifyAuthorizationCodeAuthOfflineModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: ShopifyAuthStrategyService,
          useClass: ShopifyAuthorizationCodeAuthStrategyService,
        },
        ...buildProvidersForToken(
          options,
          getAuthOptionsToken(AccessMode.Offline),
        ),
        buildControllerHackForToken(
          getAuthOptionsToken(AccessMode.Offline),
          ShopifyAuthOfflineController,
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
      exports: [ShopifyAuthStrategyService],
    };
  }
}
