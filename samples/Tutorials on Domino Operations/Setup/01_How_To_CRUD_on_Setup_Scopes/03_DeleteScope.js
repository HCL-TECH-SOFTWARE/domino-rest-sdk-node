/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Deleting a scope example */

const { DominoScope } = require('../../../../dist');
const { getDominoUserSessionSetup } = require('../../../_DominoUserSession');

const start = async () => {
  const scopeData = {
    apiName: 'sdkscpdlt',
    createSchema: false,
    description: 'Scope to be deleted by Node.JS SDK.',
    icon: 'Base64 stuff, preferably SVG',
    iconName: 'beach',
    isActive: true,
    maximumAccessLevel: 'Manager',
    nsfPath: 'Demo.nsf',
    schemaName: 'demoapi',
    server: '*',
  };
  const scp = new DominoScope(scopeData);

  const dus = await getDominoUserSessionSetup();

  const scopeResponse = await dus.createUpdateScope(scp).catch((err) => console.log(err.message));
  if (scopeResponse === undefined) {
    console.log('Failed to create scope to delete.');
    return;
  }
  
  await dus
    .deleteScope(scopeResponse.apiName)
    .then((response) => console.log(response))
    .catch((err) => console.log(err.message));
};

start();
