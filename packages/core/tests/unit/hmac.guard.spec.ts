import '@shopify/shopify-api/adapters/node';
import {
  BadRequestException,
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AuthQuery, shopifyApi, ShopifyHeader } from '@shopify/shopify-api';
import { SHOPIFY_API_CONTEXT } from '../../src/core.constants';
import { ShopifyHmacType } from '../../src/hmac/hmac.enums';
import { ShopifyHmacGuard } from '../../src/hmac/hmac.guard';
import { ShopifyHmacModule } from '../../src/hmac/hmac.module';
import {
  mockedShopifyCoreOptions,
  MockShopifyCoreModule,
} from '../helpers/mock-shopify-core-module';

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
      imports: [MockShopifyCoreModule, ShopifyHmacModule],
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
        })
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
        UnauthorizedException
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
        UnauthorizedException
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
        InternalServerErrorException
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
        UnauthorizedException
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
