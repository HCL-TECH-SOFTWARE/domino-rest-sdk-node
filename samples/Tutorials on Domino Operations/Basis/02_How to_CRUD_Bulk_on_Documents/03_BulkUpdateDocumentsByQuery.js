/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Updating bulk documents by query example. */

const { getDominoUserSessionBasis } = require('../../../_DominoUserSession');

const start = async () => {
  const request = {
    query: "form = 'Customer' and name = 'Alien'",
    replaceItems: {
      category: ['Friendly'],
    },
    // Return response as an array of DominoDocument
    // returnUpdatedDocument: true
  };

  const dus = await getDominoUserSessionBasis();

  await dus
    .bulkUpdateDocumentsByQuery('customersdb', request)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();
