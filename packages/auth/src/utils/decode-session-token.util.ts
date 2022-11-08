import { InvalidJwtError, JwtPayload } from '@shopify/shopify-api';
import * as jwt from 'jsonwebtoken';

export const decodeSessionToken = (token: string): JwtPayload => {
  let payload: JwtPayload;
  try {
    payload = jwt.decode(token) as JwtPayload;
  } catch (error: unknown) {
    throw new InvalidJwtError(
      `Failed to parse session token '${token}': ${(error as Error).message}`
    );
  }

  return payload;
};
