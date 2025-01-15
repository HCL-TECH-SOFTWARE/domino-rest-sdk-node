/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting list view entries example */

import { getDominoBasisSession } from "../../../_DominoSession.js";

const start = async () => {
  const dbs = await getDominoBasisSession();

  // you have the option to use the options variable which contains all of the parameters or the GET /lists/{name} API (example: meta), refer to the swagger of Domino REST API for more info.
  const options = {
    // meta: false,
  };

  await dbs
    .getListViewEntry('customersdb', 'Customers', options)
    .then((response) => console.log(JSON.stringify(response, null, 2)))
    .catch((err) => console.log(err.message));
};

start();
