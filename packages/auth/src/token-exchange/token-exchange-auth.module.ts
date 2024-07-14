import { DynamicModule } from '@nestjs/common';
import { getAuthOptionsToken } from '../auth.constants';
import {
  AccessMode,
  AuthStrategy,
  ShopifyAuthModuleAsyncOptions,
  ShopifyAuthStrategyService,
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
          provide: ShopifyAuthStrategyService,
          useClass: ShopifyTokenExchangeAuthStrategyOnlineService,
        },
        {
          provide: getAuthOptionsToken(AccessMode.Online),
          useValue: options,
        },
      ],
      exports: [ShopifyAuthStrategyService, ShopifyTokenExchangeService],
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
          provide: ShopifyAuthStrategyService,
          useClass: ShopifyTokenExchangeAuthStrategyOfflineService,
        },
        {
          provide: getAuthOptionsToken(AccessMode.Offline),
          useValue: options,
        },
      ],
      exports: [ShopifyAuthStrategyService, ShopifyTokenExchangeService],
    };
  }

  static forRootAsyncOnline(
    options: ShopifyAuthModuleAsyncOptions<
      AuthStrategy.TokenExchange,
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
          provide: ShopifyAuthStrategyService,
          useClass: ShopifyTokenExchangeAuthStrategyOnlineService,
        },
        ...buildProvidersForToken(
          options,
          getAuthOptionsToken(AccessMode.Online),
        ),
      ],
      exports: [ShopifyAuthStrategyService, ShopifyTokenExchangeService],
    };
  }

  static forRootAsyncOffline(
    options: ShopifyAuthModuleAsyncOptions<
      AuthStrategy.TokenExchange,
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
          provide: ShopifyAuthStrategyService,
          useClass: ShopifyTokenExchangeAuthStrategyOfflineService,
        },
        ...buildProvidersForToken(
          options,
          getAuthOptionsToken(AccessMode.Offline),
        ),
      ],
      exports: [ShopifyAuthStrategyService, ShopifyTokenExchangeService],
    };
  }
}
