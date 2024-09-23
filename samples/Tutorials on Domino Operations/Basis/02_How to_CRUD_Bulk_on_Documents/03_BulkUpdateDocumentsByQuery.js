/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Updating bulk documents by query example. */

import { DominoDocument } from "@hcl-software/domino-rest-sdk-node/DominoDocument.js";
import { getDominoBasisSession } from "../../../_DominoSession.js";

const start = async () => {
  const request = {
    query: "form = 'Customer' and name = 'Alien'",
    replaceItems: {
      category: ['Friendly'],
    },
    // Return response as an array of DominoDocument
    // returnUpdatedDocument: true
  };

  const dbs = await getDominoBasisSession();

  await dbs
    .bulkUpdateDocumentsByQuery('customersdb', request)
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
