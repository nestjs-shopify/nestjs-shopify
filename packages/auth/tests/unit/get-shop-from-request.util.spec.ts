import { JwtPayload, Session } from '@shopify/shopify-api';
import { getShopFromRequest } from '../../src/utils/get-shop-from-request.util';
import * as decodeUtil from '../../src/utils/decode-session-token.util';
import { ExecutionContext } from '@nestjs/common';
import { ShopifyHttpAdapter } from '@nestjs-shopify/core';

jest.mock('../../src/utils/decode-session-token.util', () => ({
  __esModule: true,
  decodeSessionToken: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let req: Record<string, any> = {};

const mockCtx = {
  switchToHttp: () => ({
    getRequest: () => req,
  }),
} as ExecutionContext;

const mockShopifyHttpAdapter = {
  getHeaderFromExecutionContext: (_: unknown, header: string) =>
    req['headers'][header],
  getQueryParamFromExecutionContext: (_: unknown, query: string) =>
    req['query'][query],
} as unknown as ShopifyHttpAdapter;

describe('getShopFromRequest', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('when standalone app', () => {
    const session = undefined;

    it('returns undefined when query param is missing', () => {
      req = {
        headers: {},
        url: '/',
        query: {},
      };

      expect(
        getShopFromRequest(mockCtx, mockShopifyHttpAdapter, session),
      ).toBeUndefined();
    });

    it('returns shop from query param', () => {
      req = {
        headers: {},
        url: '/?shop=test.myshopify.io',
        query: {
          shop: 'test.myshopify.io',
        },
      };

      expect(
        getShopFromRequest(mockCtx, mockShopifyHttpAdapter, session),
      ).toEqual('test.myshopify.io');
    });
  });

  describe('when embedded app', () => {
    beforeEach(() => {
      req = {
        headers: {
          authorization: 'Bearer token',
        },
        query: {},
        url: '/',
      };
    });

    it('should return shop from session if given', () => {
      const shop = getShopFromRequest(mockCtx, mockShopifyHttpAdapter, {
        shop: 'test2.myshopify.io',
      } as Session);

      expect(shop).toEqual('test2.myshopify.io');
    });

    it('should return shop from auth header', () => {
      jest.mocked(decodeUtil).decodeSessionToken.mockReturnValueOnce({
        dest: 'https://test3.myshopify.io',
      } as JwtPayload);

      const shop = getShopFromRequest(
        mockCtx,
        mockShopifyHttpAdapter,
        undefined,
      );

      expect(shop).toEqual('test3.myshopify.io');

      expect(decodeUtil.decodeSessionToken).toHaveBeenCalledWith('token');
    });

    it('should return undefined if decoding fails', () => {
      jest.mocked(decodeUtil).decodeSessionToken.mockImplementationOnce(() => {
        throw new Error();
      });

      const shop = getShopFromRequest(
        mockCtx,
        mockShopifyHttpAdapter,
        undefined,
      );

      expect(shop).toBeUndefined();

      expect(decodeUtil.decodeSessionToken).toHaveBeenCalledWith('token');
    });
  });
});
