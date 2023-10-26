/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting list view design example */

const { getDominoUserSessionSetup } = require('../../../_DominoUserSession');

const start = async () => {
  const dus = await getDominoUserSessionSetup();

  // you have the option to use the options variable which contains all of the parameters or the GET /design/{designType}/{designName} API (example: raw), refer to the swagger of Domino REST API for more info.
  const options = {
    // raw: false,
  };
  await dus
    .getListView('customersdb', 'customers', options)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();
