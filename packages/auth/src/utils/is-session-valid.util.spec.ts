import Shopify, { ApiVersion, SessionInterface } from '@shopify/shopify-api';
import { isSessionValid } from './is-session-valid.util';

describe('isSessionValid', () => {
  beforeEach(() => {
    Shopify.Context.initialize({
      API_KEY: 'foo',
      API_SECRET_KEY: 'bar',
      API_VERSION: ApiVersion.Unstable,
      HOST_NAME: 'localhost:3000',
      IS_EMBEDDED_APP: true,
      SCOPES: ['read_products'],
    });
  });

  it('returns false if scopes have changed', () => {
    expect(
      isSessionValid({
        id: 'session-id',
        scope: 'read_products,write_products',
      } as SessionInterface)
    ).toBe(false);
  });

  it('returns false if session has no access token', () => {
    expect(
      isSessionValid({
        id: 'session-id',
        scope: 'read_products',
      } as SessionInterface)
    ).toBe(false);
  });

  it('returns false if no expires is set', () => {
    expect(
      isSessionValid({
        id: 'session-id',
        scope: 'read_products',
        accessToken: 'token',
      } as SessionInterface)
    ).toBe(false);
  });

  it('returns false if expires is string in past', () => {
    expect(
      isSessionValid({
        id: 'session-id',
        scope: 'read_products',
        accessToken: 'token',
        expires: '2022-09-01T12:00:00Z' as unknown as Date,
      } as SessionInterface)
    ).toBe(false);
  });

  it('returns false if expires is Date in past', () => {
    expect(
      isSessionValid({
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
        isSessionValid({
          id: 'session-id',
          scope: 'read_products',
          accessToken: 'token',
          expires: '2022-09-01T12:00:01Z' as unknown as Date,
        } as SessionInterface)
      ).toBe(true);
    });

    it('returns true with expires as Date', () => {
      expect(
        isSessionValid({
          id: 'session-id',
          scope: 'read_products',
          accessToken: 'token',
          expires: new Date('2022-09-01T12:00:01Z'),
        } as SessionInterface)
      ).toBe(true);
    });
  });
});
