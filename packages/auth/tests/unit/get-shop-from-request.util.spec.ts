import { JwtPayload, Session } from '@shopify/shopify-api';
import {
  RequestLike,
  getShopFromRequest,
} from '../../src/utils/get-shop-from-request.util';
import * as decodeUtil from '../../src/utils/decode-session-token.util';

jest.mock('../../src/utils/decode-session-token.util', () => ({
  __esModule: true,
  decodeSessionToken: jest.fn(),
}));

describe('getShopFromRequest', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when standalone app', () => {
    const session = undefined;

    it('returns undefined when query param is missing', () => {
      const req: RequestLike = {
        headers: {},
        url: '/',
      };

      expect(getShopFromRequest(req, session)).toBeUndefined();
    });

    it('returns shop from query param', () => {
      const req: RequestLike = {
        headers: {},
        url: '/?shop=test.myshopify.io',
      };

      expect(getShopFromRequest(req, session)).toEqual('test.myshopify.io');
    });
  });

  describe('when embedded app', () => {
    const req: RequestLike = {
      headers: {
        authorization: 'Bearer token',
      },
      url: '/',
    };

    it('should return shop from session if given', () => {
      const shop = getShopFromRequest(req, {
        shop: 'test2.myshopify.io',
      } as Session);

      expect(shop).toEqual('test2.myshopify.io');
    });

    it('should return shop from auth header', () => {
      jest.mocked(decodeUtil).decodeSessionToken.mockReturnValueOnce({
        dest: 'https://test3.myshopify.io',
      } as JwtPayload);

      const shop = getShopFromRequest(req, undefined);

      expect(shop).toEqual('test3.myshopify.io');

      expect(decodeUtil.decodeSessionToken).toHaveBeenCalledWith('token');
    });

    it('should return undefined if decoding fails', () => {
      jest.mocked(decodeUtil).decodeSessionToken.mockImplementationOnce(() => {
        throw new Error();
      });

      const shop = getShopFromRequest(req, undefined);

      expect(shop).toBeUndefined();

      expect(decodeUtil.decodeSessionToken).toHaveBeenCalledWith('token');
    });
  });
});
