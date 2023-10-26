/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting list views example */

const { getDominoUserSessionBasis } = require('../../../_DominoUserSession');

const start = async () => {
  const dus = await getDominoUserSessionBasis();

  // you have the option to use the options variable which contains all of the parameters or the GET /lists API (example: type), refer to the swagger of Domino REST API for more info.
  const options = {
    // type: views,
  };

  await dus
    .getListViews('customersdb', options)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();
