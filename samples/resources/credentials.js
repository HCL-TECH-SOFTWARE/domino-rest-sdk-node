/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */
const credentialsJson = require('../../credentials.json');

exports.getCredentials = () => {
  let credentialsToUse;
  if (process.env.BASE_URL && process.env.USERNAME && process.env.PASSWORD) {
    credentialsToUse = {
      baseUrl: process.env.BASE_URL,
      credentials: {
        scope: process.env.SCOPE,
        type: process.env.TYPE,
        userName: process.env.USERNAME,
        passWord: process.env.PASSWORD,
      },
    };
  } else if (credentialsJson !== undefined) {
    credentialsToUse = credentialsJson;
  } else {
    console.log('No .env file or credentials.json provided.');
  }
  return credentialsToUse;
};
