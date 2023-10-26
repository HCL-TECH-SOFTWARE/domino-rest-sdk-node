/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Updating a scope example */

const { getDominoUserSessionSetup } = require('../../../_DominoUserSession');

const start = async () => {
  const dus = await getDominoUserSessionSetup();

  const scpResponse = await dus.getScope('customersdb2').catch((err) => console.log(err.message));
  if (scpResponse === undefined) {
    console.log('Failed to get scope to update.');
    return;
  }

  scpResponse.description = 'Updated description!';

  await dus
    .createUpdateScope(scpResponse)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();
