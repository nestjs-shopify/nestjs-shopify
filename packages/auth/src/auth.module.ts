import { DynamicModule } from '@nestjs/common';
import {
  AUTH_STRATEGY_SERVICE_TOKEN,
  getAuthorizationCodeFlowOptionsToken,
  getTokenExchangeOptionsToken,
} from './auth.constants';
import {
  AccessMode,
  AuthStrategy,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthModuleOptions,
} from './auth.interfaces';
import { ShopifyAuthOfflineController } from './offline-auth/offline-auth.controller';
import { ShopifyAuthOnlineController } from './online-auth/online-auth.controller';
import { buildControllerHackForToken } from './utils/build-controller-hack-for-token.util';
import { buildProvidersForToken } from './utils/build-provider-for-token.util';
import { ShopifyTokenExchangeService } from './token-exchange/token-exchange.service';
import { ShopifyAuthorizationCodeFlowAuthStrategyService } from './authorization-code-flow-auth-strategy.service';
import { ShopifyTokenExchangeAuthStrategyOnlineService } from './token-exchange/token-exchange-auth-strategy-online.service';
import { ShopifyTokenExchangeAuthStrategyOfflineService } from './token-exchange/token-exchange-auth-strategy-offline.service';

export class ShopifyAuthModule {
  static forRootOnline(options: ShopifyAuthModuleOptions): DynamicModule {
    if (
      'authStrategy' in options &&
      options.authStrategy === 'TOKEN_EXCHANGE'
    ) {
      return {
        module: class ShopifyAuthTokenExchangeModule {},
        global: true,
        providers: [
          ShopifyTokenExchangeService,
          {
            provide: AUTH_STRATEGY_SERVICE_TOKEN,
            useClass: ShopifyTokenExchangeAuthStrategyOnlineService,
          },
          {
            provide: getTokenExchangeOptionsToken(AccessMode.Online),
            useValue: options,
          },
        ],
        exports: [AUTH_STRATEGY_SERVICE_TOKEN, ShopifyTokenExchangeService],
      };
    }

    return {
      module: class ShopifyAuthOnlineModule {},
      global: true,
      providers: [
        {
          provide: getAuthorizationCodeFlowOptionsToken(AccessMode.Online),
          useValue: options,
        },
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
        },
        buildControllerHackForToken(
          getAuthorizationCodeFlowOptionsToken(AccessMode.Online),
          ShopifyAuthOnlineController,
        ),
      ],
      controllers: [ShopifyAuthOnlineController],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
    };
  }

  static forRootOffline(options: ShopifyAuthModuleOptions): DynamicModule {
    if (
      'authStrategy' in options &&
      options.authStrategy === 'TOKEN_EXCHANGE'
    ) {
      return {
        module: class ShopifyAuthTokenExchangeModule {},
        global: true,
        providers: [
          ShopifyTokenExchangeService,
          {
            provide: AUTH_STRATEGY_SERVICE_TOKEN,
            useClass: ShopifyTokenExchangeAuthStrategyOfflineService,
          },
          {
            provide: getTokenExchangeOptionsToken(AccessMode.Offline),
            useValue: options,
          },
        ],
        exports: [AUTH_STRATEGY_SERVICE_TOKEN, ShopifyTokenExchangeService],
      };
    }

    return {
      module: class ShopifyAuthOfflineModule {},
      global: true,
      providers: [
        {
          provide: getAuthorizationCodeFlowOptionsToken(AccessMode.Offline),
          useValue: options,
        },
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
        },
        buildControllerHackForToken(
          getAuthorizationCodeFlowOptionsToken(AccessMode.Offline),
          ShopifyAuthOfflineController,
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
    };
  }

  static forRootAsyncOnline<A extends AuthStrategy = 'AUTHORIZATION_CODE_FLOW'>(
    options: ShopifyAuthModuleAsyncOptions<A>,
  ): DynamicModule {
    if (
      'authStrategy' in options &&
      options.authStrategy === 'TOKEN_EXCHANGE'
    ) {
      return {
        module: class ShopifyAuthTokenExchangeModule {},
        global: true,
        imports: options.imports || [],
        providers: [
          ShopifyTokenExchangeService,
          {
            provide: AUTH_STRATEGY_SERVICE_TOKEN,
            useClass: ShopifyTokenExchangeAuthStrategyOnlineService,
          },
          ...buildProvidersForToken(
            options,
            getTokenExchangeOptionsToken(AccessMode.Online),
          ),
        ],
        exports: [AUTH_STRATEGY_SERVICE_TOKEN, ShopifyTokenExchangeService],
      };
    }

    return {
      module: class ShopifyAuthOnlineModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
        },
        ...buildProvidersForToken(
          options,
          getAuthorizationCodeFlowOptionsToken(AccessMode.Online),
        ),
        buildControllerHackForToken(
          getAuthorizationCodeFlowOptionsToken(AccessMode.Online),
          ShopifyAuthOnlineController,
        ),
      ],
      controllers: [ShopifyAuthOnlineController],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
    };
  }

  static forRootAsyncOffline<
    A extends AuthStrategy = 'AUTHORIZATION_CODE_FLOW',
  >(options: ShopifyAuthModuleAsyncOptions<A>): DynamicModule {
    if (
      'authStrategy' in options &&
      options.authStrategy === 'TOKEN_EXCHANGE'
    ) {
      return {
        module: class ShopifyAuthTokenExchangeModule {},
        global: true,
        imports: options.imports || [],
        providers: [
          ShopifyTokenExchangeService,
          {
            provide: AUTH_STRATEGY_SERVICE_TOKEN,
            useClass: ShopifyTokenExchangeAuthStrategyOfflineService,
          },
          ...buildProvidersForToken(
            options,
            getTokenExchangeOptionsToken(AccessMode.Offline),
          ),
        ],
        exports: [AUTH_STRATEGY_SERVICE_TOKEN, ShopifyTokenExchangeService],
      };
    }

    return {
      module: class ShopifyAuthOfflineModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
        },
        ...buildProvidersForToken(
          options,
          getAuthorizationCodeFlowOptionsToken(AccessMode.Offline),
        ),
        buildControllerHackForToken(
          getAuthorizationCodeFlowOptionsToken(AccessMode.Offline),
          ShopifyAuthOfflineController,
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
    };
  }
}
