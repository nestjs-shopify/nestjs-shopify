import { ApplicationConfig, ModuleRef } from '@nestjs/core';
import { getOptionsToken } from '../auth.constants';
import { AccessMode, ShopifyAuthModuleOptions } from '../auth.interfaces';
import { joinUrl } from './join-url.util';

export function buildAuthPath(
  moduleRef: ModuleRef,
  appConfig: ApplicationConfig,
  accessMode: AccessMode,
  multiScope?: {
    prefix: string;
    scope: string;
  },
) {
  const options = moduleRef.get<ShopifyAuthModuleOptions>(
    getOptionsToken(accessMode),
    {
      strict: false,
    },
  );
  const prefix = options.useGlobalPrefix ? appConfig.getGlobalPrefix() : '';

  const basePath = options.basePath || '';
  const url = joinUrl(prefix, basePath, 'auth');
  if (multiScope) {
    if (url.includes(multiScope.prefix)) {
      return url.replace(multiScope.prefix, multiScope.scope);
    }
  }
  return url;
}

export function buildAuthCallbackPath(
  moduleRef: ModuleRef,
  appConfig: ApplicationConfig,
  accessMode: AccessMode,
  multiScope?: {
    prefix: string;
    scope: string;
  },
) {
  const options = moduleRef.get<ShopifyAuthModuleOptions>(
    getOptionsToken(accessMode),
    {
      strict: false,
    },
  );
  const prefix = options.useGlobalPrefix ? appConfig.getGlobalPrefix() : '';

  const basePath = options.basePath || '';
  const url = joinUrl(prefix, basePath, 'callback');
  if (multiScope) {
    if (url.includes(multiScope.prefix)) {
      return url.replace(multiScope.prefix, multiScope.scope);
    }
  }
  return url;
}

/**
 *
 * @param path
 * @param prefixParamScope
 * @param scope
 * @returns
 */
export const buildAuthParamScopePath = (
  path: string,
  prefixParamScope: string,
  scope: string,
) => {
  if (path.includes(`/:${prefixParamScope}/`)) {
    return path.replace(`/:${prefixParamScope}/`, `/${scope}/`);
  }
  return path;
};
