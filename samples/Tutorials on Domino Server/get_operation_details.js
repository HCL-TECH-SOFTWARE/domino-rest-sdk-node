/* ========================================================================== *
 * Copyright (C) 2024 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* You can get operation details using Domino connector's 'getOperation' method.
 * This comes pretty handy when you want to check out the parameters for an
 * operation. */

import { DominoServer } from "@hcl-software/domino-rest-sdk-node";
import { getCredentials } from "../resources/credentials.js";

const start = async () => {
  const dominoServer = await DominoServer.getServer(getCredentials().baseUrl);
  // Let's try to get one operation under setup API.
  const dominoConnector = await dominoServer.getDominoConnector('setup');

  console.log(JSON.stringify(dominoConnector.getOperation('fetchDesignAll'), null, 2));
};

start();
