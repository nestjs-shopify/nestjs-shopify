import { Provider, Type } from '@nestjs/common';
import { PATH_METADATA } from '@nestjs/common/constants';
import { ShopifyAuthBaseController } from '../auth-base.controller';
import { ShopifyAuthModuleOptions } from '../auth.interfaces';

export function buildControllerHackForToken(
  optionsToken: string,
  hackToken: string,
  controller: Type<ShopifyAuthBaseController>
): Provider {
  return {
    provide: hackToken,
    useFactory: (options: ShopifyAuthModuleOptions) => {
      if (options.basePath) {
        Reflect.defineMetadata(PATH_METADATA, options.basePath, controller);
      }
    },
    inject: [optionsToken],
  };
}
