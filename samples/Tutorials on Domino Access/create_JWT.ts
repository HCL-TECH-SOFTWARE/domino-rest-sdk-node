/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import jwt from 'jsonwebtoken';
import fs from 'fs';

const privateKey = fs.readFileSync('private.key');

export const makeJWT = (user: string): string => {
  const claim = {
    sub: user,
    CN: user,
    iss: 'Domino REST API Demo',
    scope: '$DATA',
    aud: 'Domino',
    expSeconds: 3000,
  };
  const signOptions: jwt.SignOptions = {
    algorithm: 'RS256',
    expiresIn: '300s',
    mutatePayload: true,
  };

  const result: string = jwt.sign(claim, privateKey, signOptions);
  return result;
};
