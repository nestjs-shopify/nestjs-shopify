import { ExecutionContext, Injectable } from '@nestjs/common';
import { ShopifyAuthException } from './auth.errors';
import { AccessMode, ShopifyAuthStrategyService } from './auth.interfaces';

@Injectable()
export class ShopifyAuthorizationCodeFlowAuthStrategyService
  implements ShopifyAuthStrategyService
{
  public authenticate(
    _ctx: ExecutionContext,
    shop: string,
    accessMode: AccessMode,
  ) {
    throw new ShopifyAuthException(
      'Reauthorization Required',
      shop,
      accessMode,
    );
  }
}
