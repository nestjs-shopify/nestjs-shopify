import { AccessMode } from './auth.interfaces';

export class ShopifyAuthException extends Error {
  private status: number;

  constructor(
    message = 'Unauthorized',
    public readonly accessMode: AccessMode
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
  constructor(public shop: string, accessMode = AccessMode.Online) {
    super('Reauthorization Required (See Headers)', accessMode);
  }
}
export class ReauthRedirectException extends ShopifyAuthException {
  constructor(public shop: string, accessMode = AccessMode.Offline) {
    super('Reauthorization Required (See Redirect)', accessMode);
  }
}
