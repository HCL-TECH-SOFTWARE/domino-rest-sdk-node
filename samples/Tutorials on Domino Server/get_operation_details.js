/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* You can get operation details using Domino connector's 'getOperation' method.
 * This comes pretty handy when you want to check out the parameters for an
 * operation. */

const { DominoAccess, DominoServer } = require('@hcl-software/domino-rest-sdk-node');
const { getCredentials } = require('../resources/credentials');

const start = async () => {
  const dominoAccess = new DominoAccess(getCredentials());
  const dominoServer = await DominoServer.getServer(dominoAccess.baseUrl);
  // Let's try to get one operation under setup API.
  const dominoConnector = await dominoServer.getDominoConnector('setup');

  console.log(JSON.stringify(dominoConnector.getOperation('fetchDesignAll'), null, 2));
};

start();
