import '@shopify/shopify-api/adapters/node';
import {
  BadRequestException,
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { SHOPIFY_API_CONTEXT } from '@nestjs-shopify/core';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthQuery, shopifyApi, ShopifyHeader } from '@shopify/shopify-api';
import {
  ShopifyHmacSignator,
  ShopifyHmacType,
} from '../../src/hmac/hmac.enums';
import { ShopifyHmacGuard } from '../../src/hmac/hmac.guard';
import {
  mockedShopifyCoreOptions,
  MockShopifyCoreModule,
} from '../helpers/mock-shopify-core-module';
import {
  SHOPIFY_HMAC_KEY,
  SHOPIFY_HMAC_SIGNATOR_KEY,
} from 'packages/common/src/hmac/hmac.constants';

describe('ShopifyHmacGuard', () => {
  let guard: ShopifyHmacGuard;
  let reflector: jest.Mocked<Reflector>;

  const currentTimeInSeconds = 1662473266;
  const fakedTime = currentTimeInSeconds * 1000;
  const timestamp = currentTimeInSeconds.toString();

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.setSystemTime(fakedTime);

    const module = await Test.createTestingModule({
      imports: [MockShopifyCoreModule],
      providers: [ShopifyHmacGuard],
    })
      .overrideProvider(Reflector)
      .useValue({
        getAllAndOverride: jest.fn(),
      })
      .overrideProvider(SHOPIFY_API_CONTEXT)
      .useValue(
        shopifyApi({
          ...mockedShopifyCoreOptions,
          apiSecretKey: 'foobar',
        }),
      )
      .compile();

    guard = module.get(ShopifyHmacGuard);
    reflector = module.get(Reflector);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('without hmac type', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValueOnce(undefined);
    });

    it('should return true', async () => {
      const ctx = createExecutionContext();

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });
  });

  describe('with query param', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValueOnce(ShopifyHmacType.Query);
    });

    it('should throw bad request if hmac missing', async () => {
      const ctx = createExecutionContext({
        query: {
          hmac: undefined,
          host: 'https://test.myshopify.io',
          shop: 'test.myshopify.io',
          state: '12345678',
          timestamp,
        },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw bad request if hmac is wrong', async () => {
      const ctx = createExecutionContext({
        query: {
          hmac: 'wrong',
          host: 'https://test.myshopify.io',
          shop: 'test.myshopify.io',
          state: '12345678',
          timestamp,
        },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true if hmac is correct', async () => {
      const ctx = createExecutionContext({
        query: {
          code: 'foo',
          hmac: 'd107fbb939f091809c79d04b0fc0e0a12e0a4d08c7608897301a383a24354fce',
          host: 'https://test.myshopify.io',
          shop: 'test.myshopify.io',
          state: '12345678',
          timestamp,
        },
      });

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });
  });

  describe('with header', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValueOnce(ShopifyHmacType.Header);
    });

    it('should throw bad request if hmac missing', async () => {
      const ctx = createExecutionContext({ headers: {} });

      await expect(guard.canActivate(ctx)).rejects.toThrow(BadRequestException);
    });

    it('should throw internal server error if raw body empty', async () => {
      const ctx = createExecutionContext({
        headers: {
          [ShopifyHeader.Hmac]: 'wrong',
        },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw unauthorized if hmac is wrong', async () => {
      const body = '{"amount":0.0}';
      const ctx = createExecutionContext({
        headers: {
          [ShopifyHeader.Hmac]: 'wrong',
        },
        rawBody: Buffer.from(body),
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true if hmac is correct', async () => {
      const body = '{"amount":0.0}';
      const ctx = createExecutionContext({
        headers: {
          [ShopifyHeader.Hmac]: 'KXP0rjCPtfpj6NdrhOoXZUMaMV8qS9DQ25fY8rnjkxc=',
        },
        rawBody: Buffer.from(body),
      });

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });
  });

  describe('with app proxy and query param', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockImplementation((key) => {
        if (key === SHOPIFY_HMAC_KEY) {
          return ShopifyHmacType.Query;
        }

        if (key === SHOPIFY_HMAC_SIGNATOR_KEY) {
          return ShopifyHmacSignator.AppProxy;
        }

        return undefined;
      });
    });

    it('should throw bad request if signature missing', async () => {
      const ctx = createExecutionContext({
        query: {
          signature: undefined,
          host: 'https://test.myshopify.io',
          shop: 'test.myshopify.io',
          state: '12345678',
          timestamp,
        },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw bad request if signature is wrong', async () => {
      const ctx = createExecutionContext({
        query: {
          signature: 'wrong',
          host: 'https://test.myshopify.io',
          shop: 'test.myshopify.io',
          state: '12345678',
          timestamp,
        },
      });

      await expect(guard.canActivate(ctx)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should return true if signature is correct', async () => {
      const ctx = createExecutionContext({
        query: {
          code: 'foo',
          signature:
            '5c8eb22d6cd3e200fdf49ef087677effe9c95d5c4903b0d947d954d626890dea',
          host: 'https://test.myshopify.io',
          shop: 'test.myshopify.io',
          state: '12345678',
          timestamp,
        },
      });

      await expect(guard.canActivate(ctx)).resolves.toBe(true);
    });
  });
});

interface RequestLike {
  rawBody?: Buffer;
  headers?: Record<string, string>;
  query?: Partial<AuthQuery>;
}

function createExecutionContext(req?: RequestLike): ExecutionContext {
  const context = {
    switchToHttp: jest.fn(),
    getHandler: jest.fn(),
    getClass: jest.fn(),
  };

  context.switchToHttp.mockImplementation(() => ({
    getRequest: jest.fn().mockReturnValue(req),
  }));

  return context as unknown as ExecutionContext;
}
