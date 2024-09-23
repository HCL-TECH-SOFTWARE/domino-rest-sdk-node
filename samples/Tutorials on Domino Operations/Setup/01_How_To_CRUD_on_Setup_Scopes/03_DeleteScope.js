/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Deleting a scope example */

import { getDominoSetupSession } from "../../../_DominoSession.js";

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

  const dss = await getDominoSetupSession();

  const scopeResponse = await dss.createUpdateScope(scopeData).catch((err) => console.log(err.message));
  if (scopeResponse === undefined) {
    console.log('Failed to create scope to delete.');
    return;
  }

  await dss
    .deleteScope(scopeResponse.apiName)
    .then((response) => console.log(JSON.stringify(response.toJson(), null, 2)))
    .catch((err) => console.log(err.message));
};

start();
