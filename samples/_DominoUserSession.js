/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creates and exports different Domino user sessions that uses different connectors
 * for other JavaScript files to use. It uses both Domino access and Domino server
 * exported from _DominoAccess and _DominoServer. */

const { DominoUserSession } = require('@hcl-software/domino-rest-sdk-node');
const { dominoAccess } = require('./_DominoAccess.js');
const { dominoServer } = require('./_DominoServer.js');

/**
 * Get a Domino user session that connects to basis APIs.
 * @returns {Promise<DominoUserSession>}
 */
exports.getDominoUserSessionBasis = async () => {
  // Get the Domino connector using Domino server.
  // DominoConnector is an OpenAPI aware connection to the Domino REST API server.
  const dominoConnectorForBasis = await dominoServer.getDominoConnector('basis');
  return new DominoUserSession(dominoAccess, dominoConnectorForBasis);
};

/**
 * Get a Domino user session that connects to setup APIs.
 * @returns {Promise<DominoUserSession>}
 */
exports.getDominoUserSessionSetup = async () => {
  const dominoConnectorForBasis = await dominoServer.getDominoConnector('setup');
  return new DominoUserSession(dominoAccess, dominoConnectorForBasis);
};

/**
 * Get a Domino user session that connects to admin APIs.
 * @returns {Promise<DominoUserSession>}
 */
exports.getDominoUserSessionAdmin = async () => {
  const dominoConnectorForBasis = await dominoServer.getDominoConnector('admin');
  return new DominoUserSession(dominoAccess, dominoConnectorForBasis);
};
