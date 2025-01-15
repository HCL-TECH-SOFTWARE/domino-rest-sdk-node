/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Get expiry of current access in seconds. */

import { DominoAccess } from "@hcl-software/domino-rest-sdk-node";
import { getCredentials } from "../resources/credentials.js";

const dominoAccess = new DominoAccess(getCredentials());

const start = async () => {
  await dominoAccess.accessToken();

  // Calling this without fetching for an access token first will throw an error.
  const expiry = dominoAccess.expiry();
  console.log(`Expiry in seconds: ${expiry}`);
  // Because it's in seconds, we need to multiply it by 1000 to feed milliseconds
  // in the Date constructor.
  console.log(`Expiry in date:    ${new Date(expiry * 1000)}`);
};

start();
