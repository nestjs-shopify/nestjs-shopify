import {
  applyDecorators,
  SetMetadata,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AUTH_MODE_KEY } from '../auth.constants';
import { ShopifyAuthExceptionFilter } from '../auth.filter';
import { AccessMode } from '../auth.interfaces';
import { ShopifyAuthOnlineGuard } from './online-auth.guard';

export const ShopifyOnlineAuth = () =>
  applyDecorators(
    SetMetadata(AUTH_MODE_KEY, AccessMode.Online),
    UseGuards(ShopifyAuthOnlineGuard),
    UseFilters(ShopifyAuthExceptionFilter)
  );
