import { InvalidJwtError, JwtPayload } from '@shopify/shopify-api';
import { decode } from 'jsonwebtoken';

export const decodeSessionToken = (token: string): JwtPayload => {
  let payload: JwtPayload;
  try {
    payload = decode(token) as JwtPayload;
  } catch (error: unknown) {
    throw new InvalidJwtError(
      `Failed to parse session token '${token}': ${(error as Error).message}`,
    );
  }

  return payload;
};
