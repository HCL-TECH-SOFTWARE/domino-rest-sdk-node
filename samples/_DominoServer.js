/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creates and exports a Domino server for other JavaScript files to use. It uses
 * the base URL from the created Domino access in _DominoAccess. */

const { DominoServer } = require('@hcl-software/domino-rest-sdk-node');
const { dominoAccess } = require('./_DominoAccess');

exports.getDominoServer = async () => {
  const dominoServer = await DominoServer.getServer(dominoAccess.baseUrl);
  return dominoServer;
};

const showAvailableApis = async () => {
  const dominoServer = await this.getDominoServer();
  const apis = dominoServer.availableApis();
  console.log(apis);
};

const showOperations = async () => {
  // Also available for other available APIs such as setup, admin, etc.
  const dominoServer = await this.getDominoServer();
  const apis = await dominoServer.availableOperations('basis');
  console.log(apis);
};

const getOperation = async () => {
  // Also available for other available APIs such as setup, admin, etc.
  const dominoServer = await this.getDominoServer();
  const dominoConnector = await dominoServer.getDominoConnector('basis');
  const op = dominoConnector.getOperation('createDocument');
  console.log(op);
};

// Uncomment this to print all available APIs on the Domino REST API server.
// showAvailableApis();

// Uncomment this to print all available operations on the Domino REST API server in basis.
// showOperations();

// Uncomment this to print details of 'createDocument' operation.
// getOperation();
