import { DynamicModule } from '@nestjs/common';
import {
  AUTH_STRATEGY_SERVICE_TOKEN,
  getOptionsToken,
  TOKEN_EXCHANGE_OPTIONS_TOKEN,
} from './auth.constants';
import {
  AccessMode,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthModuleOptions,
  ShopifyAuthModuleTokenExchangeAsyncOptions,
  ShopifyAuthModuleTokenExchangeOptions,
} from './auth.interfaces';
import { ShopifyAuthOfflineController } from './offline-auth/offline-auth.controller';
import { ShopifyAuthOnlineController } from './online-auth/online-auth.controller';
import { buildControllerHackForToken } from './utils/build-controller-hack-for-token.util';
import { buildProvidersForToken } from './utils/build-provider-for-token.util';
import { ShopifyTokenExchangeService } from './token-exchange/token-exchange.service';
import { ShopifyTokenExchangeAuthStrategyService } from './token-exchange/token-exchange-auth-strategy.service';
import { ShopifyAuthorizationCodeFlowAuthStrategyService } from './authorization-code-flow-auth-strategy.service';

export class ShopifyAuthModule {
  static forRootTokenExchange(
    options: ShopifyAuthModuleTokenExchangeOptions,
  ): DynamicModule {
    return {
      module: class ShopifyAuthTokenExchangeModule {},
      global: true,
      providers: [
        ShopifyTokenExchangeService,
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyTokenExchangeAuthStrategyService,
        },
        {
          provide: TOKEN_EXCHANGE_OPTIONS_TOKEN,
          useValue: options,
        },
      ],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN, ShopifyTokenExchangeService],
    };
  }

  static forRootAsyncTokenExchange(
    options: ShopifyAuthModuleTokenExchangeAsyncOptions,
  ): DynamicModule {
    return {
      module: class ShopifyAuthTokenExchangeModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        ShopifyTokenExchangeService,
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyTokenExchangeAuthStrategyService,
        },
        ...buildProvidersForToken(options, TOKEN_EXCHANGE_OPTIONS_TOKEN),
      ],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN, ShopifyTokenExchangeService],
    };
  }

  static forRootOnline(options: ShopifyAuthModuleOptions): DynamicModule {
    return {
      module: class ShopifyAuthOnlineModule {},
      global: true,
      providers: [
        {
          provide: getOptionsToken(AccessMode.Online),
          useValue: options,
        },
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
        },
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Online),
          ShopifyAuthOnlineController,
        ),
      ],
      controllers: [ShopifyAuthOnlineController],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
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
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
        },
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Offline),
          ShopifyAuthOfflineController,
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
    };
  }

  static forRootAsyncOnline(
    options: ShopifyAuthModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: class ShopifyAuthOnlineModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
        },
        ...buildProvidersForToken(options, getOptionsToken(AccessMode.Online)),
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Online),
          ShopifyAuthOnlineController,
        ),
      ],
      controllers: [ShopifyAuthOnlineController],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
    };
  }

  static forRootAsyncOffline(
    options: ShopifyAuthModuleAsyncOptions,
  ): DynamicModule {
    return {
      module: class ShopifyAuthOfflineModule {},
      global: true,
      imports: options.imports || [],
      providers: [
        {
          provide: AUTH_STRATEGY_SERVICE_TOKEN,
          useClass: ShopifyAuthorizationCodeFlowAuthStrategyService,
        },
        ...buildProvidersForToken(options, getOptionsToken(AccessMode.Offline)),
        buildControllerHackForToken(
          getOptionsToken(AccessMode.Offline),
          ShopifyAuthOfflineController,
        ),
      ],
      controllers: [ShopifyAuthOfflineController],
      exports: [AUTH_STRATEGY_SERVICE_TOKEN],
    };
  }
}
