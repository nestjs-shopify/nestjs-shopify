import { HttpException, HttpStatus } from '@nestjs/common';
import { ShopifyAuthModuleOptions } from './auth.interfaces';

export class ShopifyAuthException extends HttpException {
  constructor(
    message = 'Unauthorized',
    public readonly options: ShopifyAuthModuleOptions
  ) {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ReauthHeaderException extends ShopifyAuthException {
  constructor(public shop: string, options: ShopifyAuthModuleOptions) {
    super('Reauthorization Required (See Headers)', options);
  }
}
export class ReauthRedirectException extends ShopifyAuthException {
  constructor(public shop: string, options: ShopifyAuthModuleOptions) {
    super('Reauthorization Required (See Redirect)', options);
  }
}
