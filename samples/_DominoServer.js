/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creates and exports a Domino server for other JavaScript files to use. It uses
 * the base URL from the created Domino access in _DominoAccess. */

const { DominoServer } = require('@hcl-software/domino-rest-sdk-node');
const { dominoAccess } = require('./_DominoAccess');

exports.dominoServer = new DominoServer(dominoAccess.baseUrl);

const showAvailableApis = async () => {
  const apis = await this.dominoServer.availableApis();
  console.log(apis);
};

const showOperations = async () => {
  // Also available for other available APIs such as setup, admin, etc.
  const apis = await this.dominoServer.availableOperations('basis');
  console.log(apis);
};

// Uncomment this to print all available APIs on the Domino REST API server.
// showAvailableApis();

// Uncomment this to print all available operations on the Domino REST API server in basis.
// showOperations();
