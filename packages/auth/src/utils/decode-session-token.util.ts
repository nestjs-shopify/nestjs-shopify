import { JwtPayload } from '@shopify/shopify-api';
import { InvalidJwtError } from '@shopify/shopify-api/dist/error';
import * as jwt from 'jsonwebtoken';

export const decodeSessionToken = (token: string): JwtPayload => {
  let payload: JwtPayload;
  try {
    payload = jwt.decode(token) as JwtPayload;
  } catch (error: any) {
    throw new InvalidJwtError(
      `Failed to parse session token '${token}': ${error.message}`
    );
  }

  return payload;
};
