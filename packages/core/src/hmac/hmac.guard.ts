import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ShopifyHmacService } from './hmac.service';

@Injectable()
export class ShopifyHmacGuard implements CanActivate {
  constructor(private readonly hmacService: ShopifyHmacService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    return this.hmacService.canActivate(context);
  }
}
