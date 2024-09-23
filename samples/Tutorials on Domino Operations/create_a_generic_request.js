/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Execute a generic request using SDK. Domino REST API Node SDK has a number of
 * built-in methods to play around with (for example createDocument, updateDocument,
 * getListViewEntry), but there are still more APIs from Domino REST API that are
 * yet to be implemented. Thus, if one needs to perform a specific operation and
 * it is not yet available on the SDK, then performing generic request is needed.
 *
 * The DominoUserSession has a method called 'request'. For this example,
 * we will be calling the request method directly to show how to perform
 * an operation from scratch. */

import { DominoAccess, DominoServer, DominoUserSession, streamToJson } from "@hcl-software/domino-rest-sdk-node";
import { getCredentials } from "../resources/credentials.js";

const start = async () => {
  const dominoAccess = new DominoAccess(getCredentials());
  const dominoServer = await DominoServer.getServer(dominoAccess.baseUrl);
  // The operation we want to execute belongs to BASIS API, so we get a
  // BASIS DominoConnector.
  const dominoConnector = await dominoServer.getDominoConnector('basis');
  // We use the DominoUserSession as it contains the 'request' method
  // we need to perform a generic request.
  const dominoUserSession = new DominoUserSession(dominoAccess, dominoConnector);

  // The parameters that the operation we want to execute needs.
  const requestOptions = {
    dataSource: 'customersdb',
    params: new Map(),
  };
  // getDocumentMetadata needs a UNID parameter so we set it here with the UNID of an
  // existing document that we know.
  requestOptions.params.set('unid', '3431740DA895807B00258A3E004C1755');

  // Uncomment to also print information about the operation we want to execute. This includes
  // details about the operation parameters. Alternatively, you can also go to Domino REST API
  // swagger UI to see all information on different operations.
  // await dominoConnector.getOperation('getDocumentMetadata').then((operation) => console.log(JSON.stringify(operation, null, 2)));

  // Calling the generic request method with the operation ID and request options.
  await dominoUserSession
    .request('getDocumentMetadata', requestOptions)
    .then(async (response) => {
      // Check HTTP status code
      if (response.status >= 400) {
        throw new Error(`Error status code: ${response.status}`);
      }
      // We parse the received datastream to JSON using SDK's built in streamToJson
      const metadata = await streamToJson(response.dataStream);
      console.log(JSON.stringify(metadata, null, 2));
    })
    .catch((err) => console.log(err));
};

start();
