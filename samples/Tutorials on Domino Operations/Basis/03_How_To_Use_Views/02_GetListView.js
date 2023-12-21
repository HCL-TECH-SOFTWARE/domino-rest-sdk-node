/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting list view design example */

const { getDominoSetupSession } = require('../../../_DominoSession');

const start = async () => {
  const dss = await getDominoSetupSession();

  // you have the option to use the options variable which contains all of the parameters or the GET /design/{designType}/{designName} API (example: raw), refer to the swagger of Domino REST API for more info.
  const options = {
    // raw: false,
  };
  await dss
    .getListView('customersdb', 'Customers', options)
    .then((response) => console.log(JSON.stringify(response, null, 2)))
    .catch((err) => console.log(err.message));
};

start();
