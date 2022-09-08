import { AccessMode } from './auth.interfaces';

export class ShopifyAuthException extends Error {
  private status: number;

  constructor(
    message = 'Unauthorized',
    public readonly shop: string,
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
