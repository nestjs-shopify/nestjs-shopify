import { InjectShopify } from '@nestjs-shopify/core';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import {
  HttpResponseError,
  InvalidJwtError,
  RequestedTokenType,
  Shopify,
} from '@shopify/shopify-api';
import { ShopifyAuthTokenExchangeException } from '../auth.errors';
import { AccessMode } from '../auth.interfaces';

@Injectable()
export class ShopifyTokenExchangeService {
  private readonly logger = new Logger(ShopifyTokenExchangeService.name);

  constructor(@InjectShopify() private readonly shopifyApi: Shopify) {}

  public async exchangeToken(
    sessionToken: string,
    shop: string,
    accessMode: AccessMode,
  ) {
    this.logger.log(`Starting ${accessMode} token exchange for shop ${shop}`);

    const requestedTokenType =
      accessMode === AccessMode.Online
        ? RequestedTokenType.OnlineAccessToken
        : RequestedTokenType.OfflineAccessToken;
    try {
      const { session } = await this.shopifyApi.auth.tokenExchange({
        requestedTokenType,
        sessionToken,
        shop,
      });
      this.logger.log(`Successfully exchanged token for shop ${shop}.`);
      return session;
    } catch (error) {
      this.logger.warn(
        `Token exchange failed for shop ${shop}: ${JSON.stringify(error)}`,
      );
      /**
       * see https://shopify.dev/docs/apps/auth/get-access-tokens/token-exchange/getting-started
       * "If your session token is expired or otherwise invalid, then the token exchange request fails with an HTTP status code of 400 Bad Request."
       */
      if (
        error instanceof InvalidJwtError ||
        (error instanceof HttpResponseError &&
          error.response.code === 400 &&
          error.response.body?.error === 'invalid_subject_token')
      ) {
        throw new ShopifyAuthTokenExchangeException(
          'Invalid token',
          shop,
          accessMode,
        );
      }

      throw new InternalServerErrorException();
    }
  }
}
