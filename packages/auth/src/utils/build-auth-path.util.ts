import { ApplicationConfig, ModuleRef } from '@nestjs/core';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';
import { joinUrl } from './join-url.util';
import { getOptionsToken } from '../auth.constants';

export function buildAuthPath(
  moduleRef: ModuleRef,
  appConfig: ApplicationConfig,
  accessMode: AccessMode
) {
  const options = moduleRef.get<ShopifyAuthModuleOptions>(
    getOptionsToken(accessMode),
    {
      strict: false,
    }
  );
  const prefix = options.useGlobalPrefix ? appConfig.getGlobalPrefix() : '';

  const basePath = options.basePath || '';
  return joinUrl(prefix, basePath, 'auth');
}

export function buildAuthCallbackPath(
  moduleRef: ModuleRef,
  appConfig: ApplicationConfig,
  accessMode: AccessMode
) {
  const options = moduleRef.get<ShopifyAuthModuleOptions>(
    getOptionsToken(accessMode),
    {
      strict: false,
    }
  );
  const prefix = options.useGlobalPrefix ? appConfig.getGlobalPrefix() : '';

  const basePath = options.basePath || '';
  return joinUrl(prefix, basePath, 'callback');
}
