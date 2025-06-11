/* ========================================================================== *
 * Copyright (C) 2025 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting a scope example */

import { getDominoBasisSession } from "../../../_DominoSession.js";

const start = async () => {
  const dbs = await getDominoBasisSession();

  await dbs
    .getScope('customersdb')
    .then((response) => console.log(JSON.stringify(response.toJson(), null, 2)))
    .catch((err) => console.log(err.message));
};

start();
