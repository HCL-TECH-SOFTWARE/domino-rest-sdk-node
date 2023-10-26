/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creating a scope example */

const { getDominoUserSessionSetup } = require('../../../_DominoUserSession');

const start = async () => {
  const scp = {
    apiName: 'customersdb2',
    createSchema: false,
    description: 'The famous demo database!!!!',
    icon: 'Base64 stuff, preferably SVG',
    iconName: 'beach',
    isActive: true,
    maximumAccessLevel: 'Manager',
    nsfPath: 'Demo.nsf',
    schemaName: 'demoapi',
    server: '*',
  };

  const dus = await getDominoUserSessionSetup();
  

  await dus
    .createUpdateScope(scp)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();
