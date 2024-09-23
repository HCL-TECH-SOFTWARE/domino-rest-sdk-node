/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Updating a scope example */

import { getDominoSetupSession } from "../../../_DominoSession.js";

const start = async () => {
  const dss = await getDominoSetupSession();

  const scpResponse = await dss.getScope('customersdb2').catch((err) => console.log(err.message));
  if (scpResponse === undefined) {
    console.log('Failed to get scope to update.');
    return;
  }

  scpResponse.description = 'Updated description!';

  await dss
    .createUpdateScope(scpResponse)
    .then((response) => console.log(JSON.stringify(response.toJson(), null, 2)))
    .catch((err) => console.log(err.message));
};

start();
