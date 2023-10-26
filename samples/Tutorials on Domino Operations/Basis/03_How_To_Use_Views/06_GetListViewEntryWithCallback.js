/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting list view entries with callback example. This provides a callback
 * that consumes each JSON entry to be logged to console. */

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

  const options = {
    subscriber: logEntry,
  };

  await dus.getListViewEntry('customersdb', 'Customers', options).catch((err) => console.log(err));
};

start();
