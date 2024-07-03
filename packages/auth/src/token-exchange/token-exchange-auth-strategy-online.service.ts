import {
  InjectShopifySessionStorage,
  SessionStorage,
  ShopifyHttpAdapter,
} from '@nestjs-shopify/core';
import { Inject } from '@nestjs/common';
import {
  AccessMode,
  ShopifyAuthModuleTokenExchangeOptions,
} from '../auth.interfaces';
import { ShopifyTokenExchangeService } from './token-exchange.service';
import { ShopifyTokenExchangeAuthStrategyBaseService } from './token-exchange-auth-strategy-base.service';
import { getTokenExchangeOptionsToken } from '../auth.constants';

export class ShopifyTokenExchangeAuthStrategyOnlineService extends ShopifyTokenExchangeAuthStrategyBaseService {
  constructor(
    @Inject(getTokenExchangeOptionsToken(AccessMode.Online))
    options: ShopifyAuthModuleTokenExchangeOptions,
    tokenExchangeService: ShopifyTokenExchangeService,
    shopifyHttpAdapter: ShopifyHttpAdapter,
    @InjectShopifySessionStorage()
    sessionStorage: SessionStorage,
  ) {
    super(options, tokenExchangeService, shopifyHttpAdapter, sessionStorage);
  }
}
