/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Fetch available APIs on the Domino REST API server. */

const { DominoServer } = require('@hcl-software/domino-rest-sdk-node');
const { getCredentials } = require('../resources/credentials');

const credentials = getCredentials();
if (credentials.baseUrl === undefined) {
  console.log("Credentials missing 'baseUrl' property.");
  return;
}

const start = async () => {
  const dominoServer = await DominoServer.getServer(credentials.baseUrl);

  console.log(dominoServer.availableApis());
};

start();
