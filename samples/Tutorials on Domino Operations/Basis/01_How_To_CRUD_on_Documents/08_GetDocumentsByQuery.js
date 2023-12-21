/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting documents by query. */

const { QueryActions } = require('../../../../dist');
const { getDominoBasisSession } = require('../../../_DominoSession');

const start = async () => {
  const request = {
    query: "Form = 'Customer' and name = ?name",
    variables: {
      name: 'Tony Stark',
    },
  };

  const dbs = await getDominoBasisSession();

  // await dus
  //   .getDocumentsByQuery('customersdb', request, QueryActions.EXPLAIN)
  //   .then((response) => console.log(JSON.stringify(response, null, 2)))
  //   .catch((err) => console.log(err.message));

  await dbs
    .getDocumentsByQuery('customersdb', request, QueryActions.EXECUTE)
    .then((response) => {
      const docs = [];
      for (const doc of response) {
        docs.push(doc.toJson());
      }
      console.log(JSON.stringify(docs, null, 2));
    })
    .catch((err) => console.log(err.message));

  // await dbs
  // .getDocumentsByQuery('customersdb', request, QueryActions.PARSE)
  // .then((response) => console.log(JSON.stringify(response, null, 2)))
  // .catch((err) => console.log(err.message));
};

start();
