import Shopify, { SessionInterface } from '@shopify/shopify-api';
import { ContextInterface } from '@shopify/shopify-api/dist/context';
import { JwtPayload } from '@shopify/shopify-api/dist/utils/decode-session-token';
import { RequestLike, ShopifyAuthSessionService } from './auth-session.service';
import * as decodeUtil from './utils/decode-session-token.util';

jest.mock('./utils/decode-session-token.util', () => ({
  __esModule: true,
  decodeSessionToken: jest.fn(),
}));

describe('ShopifyAuthSessionService', () => {
  let service: ShopifyAuthSessionService;

  beforeEach(() => {
    service = new ShopifyAuthSessionService();
    Shopify.Context = {} as ContextInterface;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when standalone app', () => {
    beforeEach(() => {
      Shopify.Context.IS_EMBEDDED_APP = false;
    });

    it('returns undefined when query param is missing', () => {
      expect(
        service.getShop({
          url: '/',
        } as RequestLike)
      ).toBeUndefined();
    });

    it('returns shop from query param', () => {
      expect(
        service.getShop({
          url: '/?shop=test.myshopify.io',
        } as RequestLike)
      ).toEqual('test.myshopify.io');
    });
  });

  describe('when embedded app', () => {
    const req: RequestLike = {
      headers: {
        authorization: 'Bearer token',
      },
      url: '/?shop=test.myshopify.io',
    };

    beforeEach(() => {
      Shopify.Context.IS_EMBEDDED_APP = true;
    });

    it('should return shop from session if given', () => {
      const shop = service.getShop(req, {
        shop: 'test2.myshopify.io',
      } as SessionInterface);

      expect(shop).toEqual('test2.myshopify.io');
    });

    it('should return shop from auth header', () => {
      jest.mocked(decodeUtil).decodeSessionToken.mockReturnValueOnce({
        dest: 'https://test3.myshopify.io',
      } as JwtPayload);

      const shop = service.getShop(req);

      expect(shop).toEqual('test3.myshopify.io');

      expect(decodeUtil.decodeSessionToken).toHaveBeenCalledWith('token');
    });

    it('should return undefined if decoding fails', () => {
      jest.mocked(decodeUtil).decodeSessionToken.mockImplementationOnce(() => {
        throw new Error();
      });

      const shop = service.getShop(req);

      expect(shop).toBeUndefined();

      expect(decodeUtil.decodeSessionToken).toHaveBeenCalledWith('token');
    });
  });
});
