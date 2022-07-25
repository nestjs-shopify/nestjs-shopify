import {
  applyDecorators,
  SetMetadata,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AUTH_MODE_KEY } from '../auth.constants';
import { ShopifyAuthExceptionFilter } from '../auth.filter';
import { AccessMode } from '../auth.interfaces';
import { ShopifyAuthOfflineGuard } from './offline-auth.guard';

export const ShopifyOfflineAuth = () =>
  applyDecorators(
    SetMetadata(AUTH_MODE_KEY, AccessMode.Offline),
    UseGuards(ShopifyAuthOfflineGuard),
    UseFilters(ShopifyAuthExceptionFilter)
  );
