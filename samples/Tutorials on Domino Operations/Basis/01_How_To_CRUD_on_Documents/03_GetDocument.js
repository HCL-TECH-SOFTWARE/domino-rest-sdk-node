/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting a document example. */

const { getDominoUserSessionBasis } = require('../../../_DominoUserSession');

const start = async () => {
  // you have the option to use the options variable which contains all of the parameters or the GET /document API (example: meta), refer to the swagger of Domino REST API for more info.
  const options = {
    // meta: false,
  };

  const dus = await getDominoUserSessionBasis();

  await dus
    .getDocument('customersdb', '3431740DA895807B00258A3E004C1755', options)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();
