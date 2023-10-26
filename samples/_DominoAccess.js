/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creates and exports a Domino access for other JavaScript files to use. It uses
 * the getCredentials utility functions to get the credentials set in the environment.
 * Be it on a .env or credentials.json. */

const { DominoAccess } = require('@hcl-software/domino-rest-node-sdk');
const { getCredentials } = require('./resources/credentials');

exports.dominoAccess = new DominoAccess(getCredentials());