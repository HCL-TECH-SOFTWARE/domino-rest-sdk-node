/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting a scope example */

import { getDominoSetupSession } from "../../../_DominoSession.js";

const start = async () => {
  const dss = await getDominoSetupSession();

  await dss
    .getScope('customersdb')
    .then((response) => console.log(JSON.stringify(response.toJson(), null, 2)))
    .catch((err) => console.log(err.message));
};

start();
