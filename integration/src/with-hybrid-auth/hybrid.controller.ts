import { ShopifyOfflineAuth, ShopifyOnlineAuth } from '@nestjs-shopify/auth';
import { Controller, Get } from '@nestjs/common';

@Controller('message')
export class HybridController {
  @Get('online')
  @ShopifyOnlineAuth()
  getOnlineMessage() {
    return {
      message: 'Online auth',
    };
  }

  @Get('offline')
  @ShopifyOfflineAuth()
  getOfflineMessage() {
    return {
      message: 'Offline auth',
    };
  }
}
