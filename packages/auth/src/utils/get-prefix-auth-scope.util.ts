import { Session } from '@shopify/shopify-api';
import { MultiScopes } from '@rh-nestjs-shopify/core';

/**
 *
 * @param scopesArray
 * @returns
 */
export const getImpliedScopes = (scopesArray: string[]) => {
  const arr = scopesArray.reduce((array, current) => {
    const matches = current.match(/write_(.*)$/);
    if (matches) {
      array.push(matches[0], `read_${matches[1]}`);
    } else {
      array.push(current);
    }
    return array;
  }, [] as string[]);
  return arr;
};

/**
 *
 * @param session
 * @param requireScopes
 * @returns
 */
export const hasShopifyScopes = (
  session: Session,
  requireScopes: string | string[],
) => {
  const hasScopes =
    typeof requireScopes === 'string'
      ? requireScopes.split(',')
      : requireScopes;

  const check = (sessionScopes: string[], requireScopes: string[]) => {
    return requireScopes.every((s) => {
      return sessionScopes.includes(s);
    });
  };

  if (!session.isOnline && session.scope) {
    const sessionScopes = session.scope.split(',');
    return check(getImpliedScopes(sessionScopes), getImpliedScopes(hasScopes));
  } else if (session.onlineAccessInfo) {
    const sessionScopes =
      session.onlineAccessInfo.associated_user_scope.split(',');
    return check(getImpliedScopes(sessionScopes), getImpliedScopes(hasScopes));
  }
  return false;
};

/**
 *
 * @param requireScopes
 * @returns
 */
export const getPrefixRedirectAuth = (
  multiScopes: MultiScopes[],
  requireScopes: string | string[],
) => {
  const scopes =
    typeof requireScopes === 'string'
      ? requireScopes.split(',')
      : requireScopes;

  for (const value of multiScopes) {
    const check = scopes.every((scope) => {
      return getImpliedScopes(value.scopes as string[]).includes(scope);
    });
    if (check === true) {
      return value.key;
    }
  }
  return '';
};

// /**
//  *
//  * @param requireScopes
//  * @param options
//  * @returns
//  */
// export const buildRedirectReAuthWithScopes = (
//   requireScopes: string | string[],
//   options: {
//     host: string;
//     shop: string;
//     apiPrefix: string;
//   },
// ) => {
//   const prefixAuth = getPrefixRedirectAuth(requireScopes);
//   return `${options.host}/${options.apiPrefix}/offline/${prefixAuth}/auth?shop=${options.shop}`;
// };
