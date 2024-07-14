import { DynamicModule } from '@nestjs/common';
import {
  AUTH_STRATEGY_SERVICE_TOKEN,
  getAuthOptionsToken,
} from '../auth.constants';
import { AccessMode, ShopifyAuthModuleAsyncOptions } from '../auth.interfaces';
import { ShopifyAuthorizationCodeAuthModuleOptions } from '../auth.interfaces';
import { ShopifyAuthOnlineController } from '../online-auth/online-auth.controller';
import { buildControllerHackForToken } from '../utils/build-controller-hack-for-token.util';
import { ShopifyAuthOfflineController } from '../offline-auth/offline-auth.controller';
import { buildProvidersForToken } from '../utils/build-provider-for-token.util';
import { ShopifyAuthorizationCodeFlowAuthStrategyService } from '../authorization-code-flow-auth-strategy.service';

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
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
        },
        buildControllerHackForToken(
          getAuthOptionsToken(AccessMode.Online),
          ShopifyAuthOnlineController,
        ),
      ],
      controllers: [ShopifyAuthOnlineController],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
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
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
        },
        buildControllerHackForToken(
          getAuthOptionsToken(AccessMode.Offline),
          ShopifyAuthOfflineController,
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
    };
  }

  static forRootAsyncOnline(
    options: ShopifyAuthModuleAsyncOptions<
      'AUTHORIZATION_CODE_FLOW',
      ShopifyAuthorizationCodeAuthModuleOptions
    >,
  ): DynamicModule {
    return {
      module: class ShopifyAuthorizationCodeAuthOnlineModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
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
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
    };
  }

  static forRootAsyncOffline(
    options: ShopifyAuthModuleAsyncOptions<
      'AUTHORIZATION_CODE_FLOW',
      ShopifyAuthorizationCodeAuthModuleOptions
    >,
  ): DynamicModule {
    return {
      module: class ShopifyAuthorizationCodeAuthOfflineModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
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
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
    };
  }
}
