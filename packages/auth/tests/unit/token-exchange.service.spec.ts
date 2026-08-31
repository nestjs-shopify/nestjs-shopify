import { InternalServerErrorException } from '@nestjs/common';
import { RequestedTokenType, Session, Shopify } from '@shopify/shopify-api';
import { AccessMode } from '../../src/auth.interfaces';
import { ShopifyTokenExchangeService } from '../../src/token-exchange/token-exchange.service';

const mockShopifyApi = {
  auth: {
    tokenExchange: jest.fn(),
  },
  config: { scopes: [] },
} as unknown as Shopify;

describe('ShopifyTokenExchangeService', () => {
  let service: ShopifyTokenExchangeService;

  beforeEach(() => {
    jest.resetAllMocks();
    service = new ShopifyTokenExchangeService(mockShopifyApi);
  });

  const mockSession = { shop: 'shop.myshopify.com' } as Session;

  function mockSuccessfulExchange() {
    (mockShopifyApi.auth.tokenExchange as jest.Mock).mockResolvedValue({
      session: mockSession,
    });
  }

  it('passes the expiring flag when exchanging offline tokens', async () => {
    mockSuccessfulExchange();

    await service.exchangeToken(
      'session-token',
      'shop.myshopify.com',
      AccessMode.Offline,
      true,
    );

    expect(mockShopifyApi.auth.tokenExchange).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
        expiring: true,
      }),
    );
  });

  it('does not pass the expiring flag when exchanging online tokens', async () => {
    mockSuccessfulExchange();

    await service.exchangeToken(
      'session-token',
      'shop.myshopify.com',
      AccessMode.Online,
      true,
    );

    expect(mockShopifyApi.auth.tokenExchange).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedTokenType: RequestedTokenType.OnlineAccessToken,
      }),
    );
    expect(
      (mockShopifyApi.auth.tokenExchange as jest.Mock).mock.calls[0][0],
    ).not.toHaveProperty('expiring');
  });

  it('defaults to non-expiring offline tokens', async () => {
    mockSuccessfulExchange();

    await service.exchangeToken(
      'session-token',
      'shop.myshopify.com',
      AccessMode.Offline,
    );

    expect(mockShopifyApi.auth.tokenExchange).toHaveBeenCalledWith(
      expect.objectContaining({
        requestedTokenType: RequestedTokenType.OfflineAccessToken,
        expiring: false,
      }),
    );
  });

  it('returns the session from a successful exchange', async () => {
    mockSuccessfulExchange();

    const session = await service.exchangeToken(
      'session-token',
      'shop.myshopify.com',
      AccessMode.Offline,
      true,
    );

    expect(session).toBe(mockSession);
  });

  it('wraps unexpected errors in an internal server error exception', async () => {
    (mockShopifyApi.auth.tokenExchange as jest.Mock).mockRejectedValue(
      new Error('boom'),
    );

    await expect(
      service.exchangeToken(
        'session-token',
        'shop.myshopify.com',
        AccessMode.Offline,
      ),
    ).rejects.toThrow(InternalServerErrorException);
  });
});
