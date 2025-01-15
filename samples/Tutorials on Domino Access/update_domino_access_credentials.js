/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Updating credentials of existing Domino access. */

import { DominoAccess } from "@hcl-software/domino-rest-sdk-node";
import { getCredentials } from "../resources/credentials.js";

const dominoAccess = new DominoAccess(getCredentials());

// Create the new credentials.
const newCredentials = {
  scope: '$DATA',
  type: 'basic',
  username: 'new_username',
  password: 'new_password',
};

dominoAccess.updateCredentials(newCredentials);
// Should print the new credentials.
console.log(JSON.stringify(dominoAccess.credentials, null, 2));
