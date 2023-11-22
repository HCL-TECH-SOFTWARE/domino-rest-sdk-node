/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting list view entries and manually handling the response datastream. */

const { streamSplit, streamTransformToJson } = require('@hcl-software/domino-rest-sdk-node');
const { getDominoUserSessionBasis } = require('../../../_DominoUserSession');

// The callback we provide. This will log each entry to console prettily.
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
  const dus = await getDominoUserSessionBasis();

  // We manually formulate the request instead of using the built-in getListViewEntry method.
  const params = new Map();
  params.set('name', 'Customers');
  params.set('count', 10000);

  const requestOptions = {
    dataSource: 'customersdb',
    params,
  };

  await dus
    .request('fetchViewEntries', requestOptions)
    .then((response) => {
      // We first decode the stream as text then use the SDK's built in stream transform methods,
      // streamSplit and streamTransformToJson, and finally pipe it to our main function that
      // logs each view entry in the console.
      response.dataStream.pipeThrough(new TextDecoderStream()).pipeThrough(streamSplit()).pipeThrough(streamTransformToJson()).pipeTo(logEntry());
    })
    .catch((error) => console.log(error));
};

start();
