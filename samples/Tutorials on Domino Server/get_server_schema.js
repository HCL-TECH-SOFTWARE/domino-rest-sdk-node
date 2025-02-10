/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Fetch available APIs on the Domino REST API server. */

import { DominoServer } from "@hcl-software/domino-rest-sdk-node";
import { getCredentials } from "../resources/credentials.js";

const start = async () => {
  const dominoServer = await DominoServer.getServer(credentials.baseUrl);

  console.log(JSON.stringify(dominoServer.availableApis(), null, 2));
};


const credentials = getCredentials();
if (credentials.baseUrl === undefined) {
  console.log("Credentials missing 'baseUrl' property.");
} else {
  start();
}
