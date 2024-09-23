/* ========================================================================== *
 * Copyright (C) 2024 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoAccess } from "@hcl-software/domino-rest-sdk-node";

/* Initialize a DominoAccess object using an access token. Needs credentials
 * type to be set to 'token'. */

const accessParams = {
  baseUrl: 'https://frascati.projectkeep.io',
  credentials: {
    type: 'oauth',
    scope: 'approvaldemo',
    appId: '3db5fd-9314-d517ff',
    appSecret: '926f60-6800-d95c6c',
    refreshToken: 'bd4a640c20a8b35b46fb448292cdc36a2c5a40ba5db29da6aecfc99e655bb11283ce55db428f70a938eab64af4e1'
  },
};

const dominoAccess = new DominoAccess(accessParams);
dominoAccess.accessToken()
  .then((token) => {
    console.log(token);
  })
  .catch((err) => {
    console.error(err);
  });

// This object will throw a TokenError if the token is empty or invalid.
// You can reupdate the token by calling updateCredentials method.
// dominoAccess.updateCredentials(<new params with the updated token>);
