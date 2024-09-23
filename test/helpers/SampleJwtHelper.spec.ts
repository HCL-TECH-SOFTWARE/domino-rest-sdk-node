/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import fs from 'fs';
import jwt from 'jsonwebtoken';

type SampleJWT = {
  bearer: string;
  sub: string;
  CN: string;
  iss: string;
  scope: string;
  aud: string;
  expSeconds: number;
  iat?: number;
  exp?: number;
};

type SampleOauthJWT = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

const template = {
  iss: 'Domino REST API Mocha Tests',
  scope: '$DATA',
  aud: 'Domino',
  expSeconds: 3000,
};

const signOptions: jwt.SignOptions = {
  algorithm: 'RS256',
  expiresIn: `${template.expSeconds}s`,
  mutatePayload: true,
};

/**
 * Helper function for testing to generate a local JWT,
 * if the private key is from the target server that would
 * be bad.
 *
 * @param user - the user to generate token for
 * @returns the signed sample JWT token.
 */
export const getSampleJWT = (user: string): SampleJWT => {
  const privateKey = fs.readFileSync('./.testcerts/private.key');
  const claim = { sub: user, CN: user, ...template };
  const bearer = jwt.sign(claim, privateKey, signOptions);
  return { bearer: bearer, ...claim };
};

/**
 * Helper function for testing to generate a local JWT with a format from OAuth refresh
 * token response, if the private key is from the target server that would be bad.
 *
 * @param user - the user to generate token for
 * @param isOauth - if the sample JWT is a response for OAuth
 * @returns the signed sample JWT token.
 */
export const getOauthSampleJWT = (user: string): SampleOauthJWT => {
  const privateKey = fs.readFileSync('./.testcerts/private.key');
  const claim = { sub: user, CN: user, ...template };
  const bearer = jwt.sign(claim, privateKey, signOptions);
  return { access_token: bearer, token_type: 'bearer', expires_in: claim.expSeconds };
};
