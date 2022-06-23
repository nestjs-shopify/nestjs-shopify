import { joinUrl } from './join-url.util';

describe('joinUrl', () => {
  it('joins urls with a leading slash', () => {
    const url = joinUrl('shopify', 'online', 'callback');
    expect(url).toStrictEqual('/shopify/online/callback');
  });

  it('skips empty paths', () => {
    const url = joinUrl('', '/shopify', '/online/', 'callback/');
    expect(url).toStrictEqual('/shopify/online/callback');
  });
});
