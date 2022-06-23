import { HttpException, HttpStatus } from '@nestjs/common';

export class ShopifyAuthException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(message, HttpStatus.UNAUTHORIZED);
  }
}

export class ReauthHeaderException extends ShopifyAuthException {
  constructor(public shop: string) {
    super('Reauthorization Required (See Headers)');
  }
}
export class ReauthRedirectException extends ShopifyAuthException {
  constructor(public shop: string) {
    super('Reauthorization Required (See Redirect)');
  }
}
