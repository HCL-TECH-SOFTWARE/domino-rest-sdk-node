/* ========================================================================== *
 * Copyright (C) 2024 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

const { DominoAccess } = require('@hcl-software/domino-rest-sdk-node');

/* Initialize a DominoAccess object using an access token. Needs credentials
 * type to be set to 'token'. */

const accessParams = {
  baseUrl: 'https://sample.server.com',
  credentials: {
    type: 'token',
    token: 'tokentokentoken',
  },
};

const dominoAccess = new DominoAccess(accessParams);

// This object will throw a TokenError if the token is empty or invalid.
// You can reupdate the token by calling updateCredentials method.
// dominoAccess.updateCredentials(<new params with the updated token>);
