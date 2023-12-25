/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creating a scope example */

const { getDominoSetupSession } = require('../../../_DominoSession');

const start = async () => {
  const scp = {
    apiName: 'customersdb',
    createSchema: false,
    description: 'The famous demo database!!!!',
    icon: 'Base64 stuff, preferably SVG',
    iconName: 'beach',
    isActive: true,
    maximumAccessLevel: 'Manager',
    nsfPath: 'customers.nsf',
    schemaName: 'customers',
    server: '*',
  };

  const dss = await getDominoSetupSession();

  await dss
    .createUpdateScope(scp)
    .then((response) => console.log(JSON.stringify(response.toJson(), null, 2)))
    .catch((err) => console.log(err.message));
};

start();
