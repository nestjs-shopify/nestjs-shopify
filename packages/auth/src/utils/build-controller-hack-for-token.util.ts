import { randomUUID } from 'crypto';
import { Controller, Provider, Type } from '@nestjs/common';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { ShopifyAuthorizationCodeAuthModuleOptions } from '../auth.interfaces';

/**
 * Used to dynamically override the auth controller's path
 */
export function buildControllerHackForToken(
  optionsToken: string,
  controller: Type<ShopifyAuthBaseController>,
): Provider {
  return {
    provide: randomUUID(),
    useFactory: (options: ShopifyAuthorizationCodeAuthModuleOptions) => {
      if (options.basePath) {
        Controller(options.basePath)(controller);
      }
    },
    inject: [optionsToken],
  };
}
