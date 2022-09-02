import Shopify, { SessionInterface } from '@shopify/shopify-api';

export const isSessionValid = (session: SessionInterface): boolean =>
  !hasScopesChanged(session) &&
  !!session.accessToken &&
  !isSessionExpired(session);

const isSessionExpired = (session: SessionInterface) =>
  !session.expires || new Date(session.expires) < new Date();

const hasScopesChanged = (session: SessionInterface): boolean =>
  !Shopify.Context.SCOPES.equals(session.scope);
