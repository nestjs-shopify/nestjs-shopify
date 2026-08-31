import { Shopify } from '@shopify/shopify-api';
import { ShopifyHttpAdapter } from '../../src/http/http.adapter';

const mockShopifyApi = {
  auth: {
    callback: jest.fn(),
  },
} as unknown as Shopify;

class TestHttpAdapter extends ShopifyHttpAdapter<unknown, unknown> {
  protected setHeader(): void {
    // no-op: not used in these tests
  }
  protected extractHeaders() {
    return {};
  }
  protected extractQueryParams<Query = Record<string, unknown>>(): Query {
    return {} as Query;
  }
}

describe('ShopifyHttpAdapter#beginCallback', () => {
  let adapter: ShopifyHttpAdapter<unknown, unknown>;

  beforeEach(() => {
    jest.resetAllMocks();
    adapter = new TestHttpAdapter(mockShopifyApi);
  });

  it.each([true, false])(
    'passes the expiring flag (%p) to the OAuth callback',
    async (expiring) => {
      (mockShopifyApi.auth.callback as jest.Mock).mockResolvedValue({
        session: undefined,
      });

      await adapter.beginCallback({}, {}, expiring);

      expect(mockShopifyApi.auth.callback).toHaveBeenCalledWith(
        expect.objectContaining({ expiring }),
      );
    },
  );

  it('defaults the expiring flag to false', async () => {
    (mockShopifyApi.auth.callback as jest.Mock).mockResolvedValue({
      session: undefined,
    });

    await adapter.beginCallback({}, {});

    expect(mockShopifyApi.auth.callback).toHaveBeenCalledWith(
      expect.objectContaining({ expiring: false }),
    );
  });
});
