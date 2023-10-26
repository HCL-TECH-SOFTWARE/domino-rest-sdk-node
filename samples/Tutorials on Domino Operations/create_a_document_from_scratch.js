/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creates a document using Domino REST API SDK from scratch. This example will
 * include initializing DominoAccess and DominoServer, and using both of it to
 * create a DominoUserSession to call the createDocument method.
 *
 * This example uses createDocument method, but all other operations can also
 * apply to this example, as long as the correct parameters are given. */

const { DominoAccess, DominoServer, DominoUserSession } = require('@hcl-software/domino-rest-node-sdk');
const { getCredentials } = require('../resources/credentials');

const start = async () => {
  const dominoAccess = new DominoAccess(getCredentials());
  const dominoServer = new DominoServer(dominoAccess.baseUrl);
  // Get basis domino connector because create document is only available on basis API.
  const dominoConnector = await dominoServer.getDominoConnector('basis');
  const dominoUserSession = new DominoUserSession(dominoAccess, dominoConnector);

  // The document data we want to save.
  const docData = {
    category: ['Genius', 'Billionaire', 'Playboy', 'Philanthropist'],
    name: 'Tony Stark',
    Form: 'Customer',
  };

  await dominoUserSession
    .createDocument('customers', docData)
    .then((doc) => console.log(doc))
    .catch((error) => console.log(error));
};

start();
