import { AccessMode } from '../auth.interfaces';
import {
  ShopifyAuthOfflineController,
  ShopifyAuthOnlineController,
} from '../controllers/auth.controller';
import { ShopifyGraphqlController } from '../controllers/graphql.controller';

export const getControllersByAccessMode = (accessMode: AccessMode) =>
  ({
    [AccessMode.Offline]: [ShopifyAuthOfflineController],
    [AccessMode.Online]: [
      ShopifyAuthOnlineController,
      ShopifyGraphqlController,
    ],
  }[accessMode]);
