/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Execute a generic request using SDK. Domino user session has a number of
 * built-in methods to play around with (for example createDocument, updateDocument,
 * getListViewEntry), but there are still more APIs from Domino REST API that are
 * yet to be implemented. Thus, if one needs to perform a specific operation and
 * it is not yet available on the SDK, then performing generic request is needed.
 *
 * The Domino user session has a method called 'request', that we can use. All the
 * built-in operations that the SDK has, uses it under the hood. But, for this
 * example, we will be calling the request method directly as the operation we
 * want is not yet built on the Domino user session.
 *
 * In this example, we will be creating a document using createDocument method,
 * and then perform the 'getDocumentMetadata' operation to it using the generic
 * request method. */

const { DominoAccess, DominoServer, DominoUserSession } = require('@hcl-software/domino-rest-node-sdk');
const { getCredentials } = require('../resources/credentials');

const start = async () => {
  const dominoAccess = new DominoAccess(getCredentials());
  const dominoServer = new DominoServer(dominoAccess.baseUrl);
  // Both operations that we want to call (createDocument and getDocumentMetadata)
  // are conveniently available under basis API. So there's no need to create another
  // Domino user session with a different connector.
  const dominoConnector = await dominoServer.getDominoConnector('basis');
  const dominoUserSession = new DominoUserSession(dominoAccess, dominoConnector);

  // The document data we want to save.
  const docData = {
    category: ['Genius', 'Billionaire', 'Playboy', 'Philanthropist'],
    name: 'Tony Stark',
    Form: 'Customer',
  };

  const doc = await dominoUserSession.createDocument('customers', docData).catch((error) => console.log(error));
  if (doc === undefined) {
    console.log('Failed to create document.');
    return;
  }

  // The parameters that the operation we want to execute needs.
  const requestOptions = {
    dataSource: 'customers',
    params: new Map(),
  };
  // getDocumentMetadata needs a UNID parameter so we set it here with the UNID of the
  // document we created earlier.
  requestOptions.params.set('unid', doc.getUNID());

  // Uncomment to also print information about the operation we want to execute. This includes
  // details about the operation parameters. Alternatively, you can also go to Domino REST API
  // swagger UI to see all information on different operations.
  // await dominoConnector.getOperation('getDocumentMetadata').then((operation) => console.log(operation));

  // Calling the generic request method with the operation ID and request options.
  await dominoUserSession
    .request('getDocumentMetadata', requestOptions)
    .then((metadata) => console.log(metadata))
    .catch((err) => console.log(err));
};

start();
