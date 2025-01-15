/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting a document example. */

import { getDominoBasisSession } from '../../../_DominoSession.js';

const start = async () => {
  // you have the option to use the options variable which contains all of the parameters or the GET /document API (example: meta), refer to the swagger of Domino REST API for more info.
  const options = {
    // meta: false,
  };

  const dbs = await getDominoBasisSession();

  await dbs
    .getDocument('customersdb', 'FC9670AE0A33E92185258B020057390D', options)
    .then((response) => console.log(JSON.stringify(response.toJson(), null, 2)))
    .catch((err) => console.log(err.message));
};

start();
