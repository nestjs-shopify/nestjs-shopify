import { DynamicModule } from '@nestjs/common';
import {
  AUTH_STRATEGY_SERVICE_TOKEN,
  getTokenExchangeOptionsToken,
} from '../auth.constants';
import {
  AccessMode,
  ShopifyAuthModuleAsyncOptions,
  ShopifyTokenExchangeAuthModuleOptions,
} from '../auth.interfaces';
import { buildProvidersForToken } from '../utils/build-provider-for-token.util';
import { ShopifyTokenExchangeService } from './token-exchange.service';
import { ShopifyTokenExchangeAuthStrategyOnlineService } from './token-exchange-auth-strategy-online.service';
import { ShopifyTokenExchangeAuthStrategyOfflineService } from './token-exchange-auth-strategy-offline.service';

export class ShopifyTokenExchangeAuthModule {
  static forRootOnline(
    options: ShopifyTokenExchangeAuthModuleOptions,
  ): DynamicModule {
    return {
      module: class ShopifyTokenExchangeAuthOnlineModule {},
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

  static forRootOffline(
    options: ShopifyTokenExchangeAuthModuleOptions,
  ): DynamicModule {
    return {
      module: class ShopifyTokenExchangeAuthOfflineModule {},
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

  static forRootAsyncOnline(
    options: ShopifyAuthModuleAsyncOptions<
      'TOKEN_EXCHANGE',
      ShopifyTokenExchangeAuthModuleOptions
    >,
  ): DynamicModule {
    return {
      module: class ShopifyTokenExchangeAuthOnlineModule {},
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

  static forRootAsyncOffline(
    options: ShopifyAuthModuleAsyncOptions<
      'TOKEN_EXCHANGE',
      ShopifyTokenExchangeAuthModuleOptions
    >,
  ): DynamicModule {
    return {
      module: class ShopifyTokenExchangeAuthOfflineModule {},
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
}
