import { JwtPayload, SessionInterface, Shopify } from '@shopify/shopify-api';
import { AuthScopes } from '@shopify/shopify-api/dist/auth/scopes';
import {
  RequestLike,
  ShopifyAuthSessionService,
} from '../../src/auth-session.service';
import * as decodeUtil from '../../src/utils/decode-session-token.util';

jest.mock('../../src/utils/decode-session-token.util', () => ({
  __esModule: true,
  decodeSessionToken: jest.fn(),
}));

describe('ShopifyAuthSessionService', () => {
  let service: ShopifyAuthSessionService;

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('.isValid', () => {
    const shopifyApi = {
      config: {
        apiKey: 'foo',
        apiSecretKey: 'bar',
        isEmbeddedApp: false,
        scopes: new AuthScopes(['read_products']),
      },
    } as Shopify;

    beforeEach(() => {
      service = new ShopifyAuthSessionService(shopifyApi);
    });

    it('returns false if scopes have changed', () => {
      expect(
        service.isValid({
          id: 'session-id',
          scope: 'read_products,write_products',
        } as SessionInterface)
      ).toBe(false);
    });

    it('returns false if session has no access token', () => {
      expect(
        service.isValid({
          id: 'session-id',
          scope: 'read_products',
        } as SessionInterface)
      ).toBe(false);
    });

    it('returns false if no expires is set', () => {
      expect(
        service.isValid({
          id: 'session-id',
          scope: 'read_products',
          accessToken: 'token',
        } as SessionInterface)
      ).toBe(false);
    });

    it('returns false if expires is string in past', () => {
      expect(
        service.isValid({
          id: 'session-id',
          scope: 'read_products',
          accessToken: 'token',
          expires: '2022-09-01T12:00:00Z' as unknown as Date,
        } as SessionInterface)
      ).toBe(false);
    });

    it('returns false if expires is Date in past', () => {
      expect(
        service.isValid({
          id: 'session-id',
          scope: 'read_products',
          accessToken: 'token',
          expires: new Date('2022-09-01T12:00:00Z'),
        } as SessionInterface)
      ).toBe(false);
    });

    describe('valid input', () => {
      beforeEach(() => {
        jest.useFakeTimers('modern');
        jest.setSystemTime(new Date('2022-09-01T12:00:00Z'));
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('returns true with expires as string', () => {
        expect(
          service.isValid({
            id: 'session-id',
            scope: 'read_products',
            accessToken: 'token',
            expires: '2022-09-01T12:00:01Z' as unknown as Date,
          } as SessionInterface)
        ).toBe(true);
      });

      it('returns true with expires as Date', () => {
        expect(
          service.isValid({
            id: 'session-id',
            scope: 'read_products',
            accessToken: 'token',
            expires: new Date('2022-09-01T12:00:01Z'),
          } as SessionInterface)
        ).toBe(true);
      });
    });
  });

  describe('.getShop', () => {
    describe('when standalone app', () => {
      const shopifyApi = {
        config: {
          isEmbeddedApp: false,
        },
      } as Shopify;

      beforeEach(() => {
        service = new ShopifyAuthSessionService(shopifyApi);
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
      const shopifyApi = {
        config: {
          isEmbeddedApp: true,
        },
      } as Shopify;
      const req: RequestLike = {
        headers: {
          authorization: 'Bearer token',
        },
        url: '/?shop=test.myshopify.io',
      };

      beforeEach(() => {
        service = new ShopifyAuthSessionService(shopifyApi);
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
        jest
          .mocked(decodeUtil)
          .decodeSessionToken.mockImplementationOnce(() => {
            throw new Error();
          });

        const shop = service.getShop(req);

        expect(shop).toBeUndefined();

        expect(decodeUtil.decodeSessionToken).toHaveBeenCalledWith('token');
      });
    });
  });
});
