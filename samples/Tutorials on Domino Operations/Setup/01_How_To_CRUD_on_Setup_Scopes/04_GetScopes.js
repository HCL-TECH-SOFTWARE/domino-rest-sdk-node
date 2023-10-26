/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting scopes example */

const { getDominoUserSessionSetup } = require('../../../_DominoUserSession');

const start = async () => {
  const dus = await getDominoUserSessionSetup();

  await dus
    .getScopes()
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();
