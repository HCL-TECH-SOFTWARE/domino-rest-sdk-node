/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting documents by query. */

const { QueryActions } = require('../../../../dist');
const { getDominoUserSessionBasis } = require('../../../_DominoUserSession');

const start = async () => {
  const request = {
    query: "Form = 'Customer' and name = ?name",
    variables: {
      name: 'Tony Stark',
    },
  };

  const dus = await getDominoUserSessionBasis();

  // await dus
  //   .getDocumentsByQuery('demoron', request, QueryActions.EXPLAIN)
  //   .then((response) => console.log(response))
  //   .catch((err) => console.log(err.message));

  await dus
    .getDocumentsByQuery('customersdb', request, QueryActions.EXECUTE)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));

  // await dus
  // .getDocumentsByQuery('demoron', request, QueryActions.PARSE)
  // .then((response) => console.log(response))
  // .catch((err) => console.log(err.message));
};

start();
