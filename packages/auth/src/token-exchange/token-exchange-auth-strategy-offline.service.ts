import {
  InjectShopifySessionStorage,
  SessionStorage,
  ShopifyHttpAdapter,
} from '@nestjs-shopify/core';
import { Inject } from '@nestjs/common';
import {
  AccessMode,
  ShopifyTokenExchangeAuthModuleOptions,
} from '../auth.interfaces';
import { ShopifyTokenExchangeService } from './token-exchange.service';
import { ShopifyTokenExchangeAuthStrategyBaseService } from './token-exchange-auth-strategy-base.service';
import { getTokenExchangeOptionsToken } from '../auth.constants';

export class ShopifyTokenExchangeAuthStrategyOfflineService extends ShopifyTokenExchangeAuthStrategyBaseService {
  constructor(
    @Inject(getTokenExchangeOptionsToken(AccessMode.Offline))
    options: ShopifyTokenExchangeAuthModuleOptions,
    tokenExchangeService: ShopifyTokenExchangeService,
    shopifyHttpAdapter: ShopifyHttpAdapter,
    @InjectShopifySessionStorage()
    sessionStorage: SessionStorage,
  ) {
    super(options, tokenExchangeService, shopifyHttpAdapter, sessionStorage);
  }
}
