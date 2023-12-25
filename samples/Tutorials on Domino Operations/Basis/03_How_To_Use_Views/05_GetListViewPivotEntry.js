/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting list pivot entry example */

const { getDominoBasisSession } = require('../../../_DominoSession');

const start = async () => {
  const dbs = await getDominoBasisSession();

  // you have the option to use the options variable which contains all of the parameters or the GET /listspivot/{name} API (example: count), refer to the swagger of Domino REST API for more info.
  const options = {
    // count: 50,
  };

  await dbs
    .getListViewPivotEntry('customersdb', 'Customers', 'name', options)
    .then((response) => console.log(JSON.stringify(response, null, 2)))
    .catch((err) => console.log(err.message));
};

start();
