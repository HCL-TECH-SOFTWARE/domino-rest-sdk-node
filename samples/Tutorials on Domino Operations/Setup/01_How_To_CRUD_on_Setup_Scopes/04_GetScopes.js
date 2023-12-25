/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Getting scopes example */

const { getDominoSetupSession } = require('../../../_DominoSession');

const start = async () => {
  const dss = await getDominoSetupSession();

  await dss
    .getScopes()
    .then((response) => {
      const scps = [];
      for (const res of response) {
        scps.push(res.toJson());
      }
      console.log(JSON.stringify(scps, null, 2));
    })
    .catch((err) => console.log(err.message));
};

start();
