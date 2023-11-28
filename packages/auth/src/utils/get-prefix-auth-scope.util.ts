import { MultiScopes } from '@rh-nestjs-shopify/core';
import { Session } from '@shopify/shopify-api';

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
  return arr.filter((i) => (i != null || i != undefined) && i != '');
};

/**
 *
 * @param session
 * @param requireScopes
 * @returns
 * `1` : Pass,
 * `-1` : Offline Scope not validate,
 * `-2` : Staff Scope not validate
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

  const checkOfflineScope = check(
    getImpliedScopes((session?.scope || '').split(',')),
    getImpliedScopes(hasScopes),
  );

  if (!checkOfflineScope) {
    return -1;
  }

  if (checkOfflineScope && session.onlineAccessInfo) {
    const sessionScopes =
      session.onlineAccessInfo.associated_user_scope.split(',');
    return check(getImpliedScopes(sessionScopes), getImpliedScopes(hasScopes))
      ? 1
      : -2;
  }

  return -1;
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
