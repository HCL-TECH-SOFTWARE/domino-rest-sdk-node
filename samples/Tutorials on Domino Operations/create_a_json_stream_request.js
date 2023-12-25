/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Using requestJsonStream method. It automatically pipes the request to your
 * given subscriber method.
 *
 * TextDecoderStream -> drapiSdk.streamSplit -> drapiSdk.streamTransformToJson
 * -> subscriber */

const { DominoAccess, DominoServer, DominoUserSession } = require('@hcl-software/domino-rest-sdk-node');
const { getCredentials } = require('../resources/credentials');

/**
 * Our subscriber method. It logs each entries from view prettily. This gets each
 * JSON entry from the stream pipe.
 *
 * @returns a writable stream.
 */
const logEntry = () => {
  let count = 1;
  console.log(`${'COUNT'.padEnd(20)} ${'UNID'.padEnd(25)} ${'NAME'.padEnd(20)} ${'CATEGORIES'}`);
  return new WritableStream({
    write(json) {
      const name = json.name ? json.name : 'NO_NAME';
      const category = json.category ? `[${json.category}]` : 'NO_CATEGORY';
      console.log(` ${(count++).toString().padEnd(5)} ${json['@unid'].padEnd(30)} ${name.padEnd(20)} ${category}`);
    },
  });
};

const start = async () => {
  const dominoAccess = new DominoAccess(getCredentials());
  const dominoServer = await DominoServer.getServer(dominoAccess.baseUrl);
  const dominoConnector = await dominoServer.getDominoConnector('basis');
  const dus = new DominoUserSession(dominoAccess, dominoConnector);

  // We manually formulate the request instead of using the built-in getListViewEntry method.
  const params = new Map();
  params.set('name', 'Customers');
  params.set('count', 10000);

  const requestOptions = {
    dataSource: 'customersdb',
    params,
  };

  await dus.requestJsonStream('fetchViewEntries', requestOptions, logEntry).catch((error) => console.log(error));
};

start();
