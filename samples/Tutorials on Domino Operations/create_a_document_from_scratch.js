/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creates a document using Domino REST API SDK from scratch. This example will
 * include initializing DominoAccess and DominoServer, and using both of it to
 * create a DominoBasisSession to call the createDocument method.
 *
 * This example uses createDocument method, but all other BASIS operations can also
 * apply to this example, as long as the correct parameters are given. */

import { DominoAccess, DominoServer, DominoBasisSession } from "@hcl-software/domino-rest-sdk-node";
import { getCredentials } from "../resources/credentials.js";

const start = async () => {
  const dominoAccess = new DominoAccess(getCredentials());
  const dominoServer = await DominoServer.getServer(dominoAccess.baseUrl);
  // Get basis domino session.
  const dominoBasisSession = await DominoBasisSession.getBasisSession(dominoAccess, dominoServer);

  // The document data we want to save.
  const docData = {
    category: ['Genius', 'Billionaire', 'Playboy', 'Philanthropist'],
    name: 'Tony Stark',
    Form: 'Customer',
  };

  await dominoBasisSession
    .createDocument('customersdb', docData)
    .then((doc) => console.log(JSON.stringify(doc.toJson(), null, 2)))
    .catch((error) => console.log(error));
};

start();
