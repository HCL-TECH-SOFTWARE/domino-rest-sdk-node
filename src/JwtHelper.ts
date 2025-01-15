/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import jwt from 'jsonwebtoken';
import { TokenDecodeError } from './errors/index.js';

/**
 * Expiry of token in seconds, to compare with Date(), needs to be multiplied by 1000.
 *
 * @param token - JWT Token as string
 * @returns the token expiry in seconds, defaults to 0 if property 'exp' is not found.
 *
 * @throws an error if token cannot be decoded.
 */
export const getExpiry = (token: string): number => {
  const decoded: jwt.JwtPayload | null = jwt.decode(token) as jwt.JwtPayload | null;
  if (decoded === null) {
    throw new TokenDecodeError(token);
  }
  return decoded.exp ? decoded.exp : 0;
};

/**
 * Checks if a token is expired.
 *
 * @param token - JWT token as string
 * @returns true or false whether given token is expired.
 *
 * @throws an error if token cannot be decoded.
 */
export const isJwtExpired = (token: string): boolean => {
  const decoded: jwt.JwtPayload | null = jwt.decode(token) as jwt.JwtPayload | null;
  if (decoded === null) {
    throw new TokenDecodeError(token);
  }
  const exp = (decoded.exp ?? 0) * 1000;
  const now = new Date().getTime();
  return exp <= now;
};
