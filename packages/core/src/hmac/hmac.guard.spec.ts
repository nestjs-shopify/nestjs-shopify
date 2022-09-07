import {
  BadRequestException,
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import Shopify, { AuthQuery, ShopifyHeader } from '@shopify/shopify-api';
import { ContextInterface } from '@shopify/shopify-api/dist/context';
import { ShopifyHmacType } from './hmac.enums';
import { ShopifyHmacGuard } from './hmac.guard';
import { ShopifyHmacModule } from './hmac.module';

describe('ShopifyHmacGuard', () => {
  let guard: ShopifyHmacGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ShopifyHmacModule],
    })
      .overrideProvider(Reflector)
      .useValue({
        getAllAndOverride: jest.fn(),
      })
      .compile();

    Shopify.Context = {
      API_SECRET_KEY: 'foobar',
    } as ContextInterface;

    guard = module.get(ShopifyHmacGuard);
    reflector = module.get(Reflector);
  });

  describe('without hmac type', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValueOnce(undefined);
    });

    it('should return true', () => {
      const ctx = createExecutionContext();
      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('with query param', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValueOnce(ShopifyHmacType.Query);
    });

    it('should throw bad request if hmac missing', () => {
      const ctx = createExecutionContext({
        query: {
          hmac: undefined,
          host: 'https://test.myshopify.io',
          shop: 'test.myshopify.io',
          state: '12345678',
          timestamp: '1662473266',
        },
      });

      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('should throw bad request if hmac is wrong', () => {
      const ctx = createExecutionContext({
        query: {
          hmac: 'wrong',
          host: 'https://test.myshopify.io',
          shop: 'test.myshopify.io',
          state: '12345678',
          timestamp: '1662473266',
        },
      });

      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('should return true if hmac is correct', () => {
      const ctx = createExecutionContext({
        query: {
          code: 'foo',
          hmac: '58e42546fa36deb542ab297d2c5e133412470f39ada4b3c6dc974b9f54b04184',
          host: 'https://test.myshopify.io',
          shop: 'test.myshopify.io',
          state: '12345678',
          timestamp: '1662473266',
        },
      });

      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('with header', () => {
    beforeEach(() => {
      reflector.getAllAndOverride.mockReturnValueOnce(ShopifyHmacType.Header);
    });

    it('should throw bad request if hmac missing', () => {
      const ctx = createExecutionContext({ headers: {} });

      expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });

    it('should throw internal server error if raw body empty', () => {
      const ctx = createExecutionContext({
        headers: {
          [ShopifyHeader.Hmac]: 'wrong',
        },
      });

      expect(() => guard.canActivate(ctx)).toThrow(
        InternalServerErrorException
      );
    });

    it('should throw unauthorized if hmac is wrong', () => {
      const body = '{"amount":0.0}';
      const ctx = createExecutionContext({
        headers: {
          [ShopifyHeader.Hmac]: 'wrong',
        },
        rawBody: Buffer.from(body),
      });

      expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    });

    it('should return true if hmac is correct', () => {
      const body = '{"amount":0.0}';
      const ctx = createExecutionContext({
        headers: {
          [ShopifyHeader.Hmac]: 'KXP0rjCPtfpj6NdrhOoXZUMaMV8qS9DQ25fY8rnjkxc=',
        },
        rawBody: Buffer.from(body),
      });

      expect(guard.canActivate(ctx)).toBe(true);
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
