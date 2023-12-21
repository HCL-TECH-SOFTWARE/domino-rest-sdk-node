/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting bulk documents example. */

const { default: DominoDocument } = require('@hcl-software/domino-rest-sdk-node/DominoDocument');
const { getDominoBasisSession } = require('../../../_DominoSession');

const start = async () => {
  const unids = ['3431740DA895807B00258A3E004C1755', 'E1B85FB45E5F110F00258A0D006018A4', '7687D8449289E55F00258A3E0050EB3E'];

  // Only one of the following UNIDs exists.
  // const unids = ['F9D1F6348963AB6000258A0Ds06015AB', '62066781DBB0842400258A0D0068D5CC', 'E8ss5FB45E5F110F00228A0DS06018A4'];

  // you have the option to use the options variable which contains all of the parameters or the POST /bulk/unid API (example: meta), refer to the swagger of Domino REST API for more info.
  const options = {
    // meta: false,
  };

  const dbs = await getDominoBasisSession();

  await dbs
    .bulkGetDocuments('customersdb', unids, options)
    .then((response) => {
      const output = [];
      for (const res of response) {
        if (res instanceof DominoDocument) {
          output.push(res.toJson());
        } else {
          output.push(res);
        }
      }
      console.log(JSON.stringify(output, null, 2));
    })
    .catch((err) => console.log(err.message));
};

start();
