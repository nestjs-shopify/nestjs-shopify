import { AccessMode, UseShopifyAuth } from '@rh-nestjs-shopify/auth';
import { Controller, Get } from '@nestjs/common';

@Controller('message')
export class HybridController {
  @Get('online')
  @UseShopifyAuth(AccessMode.Online)
  getOnlineMessage() {
    return {
      message: 'Online auth',
    };
  }

  @Get('offline')
  @UseShopifyAuth(AccessMode.Offline)
  getOfflineMessage() {
    return {
      message: 'Offline auth',
    };
  }
}
