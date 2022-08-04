import { ShopifyAuthModuleOptions } from './auth.interfaces';

export class ShopifyAuthException extends Error {
  private status: number;

  constructor(
    message = 'Unauthorized',
    public readonly options: ShopifyAuthModuleOptions
  ) {
    super(message);
    this.status = 403;
  }

  setStatus(status: number): this {
    this.status = status;
    return this;
  }

  getStatus(): number {
    return this.status;
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
