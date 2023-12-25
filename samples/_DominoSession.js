/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creates and exports different Domino user sessions that uses different connectors
 * for other JavaScript files to use. It uses both Domino access and Domino server
 * exported from _DominoAccess and _DominoServer. */

const { DominoUserSession, DominoBasisSession, DominoSetupSession } = require('@hcl-software/domino-rest-sdk-node');
const { dominoAccess } = require('./_DominoAccess.js');
const { getDominoServer } = require('./_DominoServer.js');

/**
 * Get a Domino basis session.
 * @returns {Promise<DominoBasisSession>}
 */
exports.getDominoBasisSession = async () => {
  const dominoServer = await getDominoServer();
  return await DominoBasisSession.getBasisSession(dominoAccess, dominoServer);
};

/**
 * Get a Domino setup session.
 * @returns {Promise<DominoSetupSession>}
 */
exports.getDominoSetupSession = async () => {
  const dominoServer = await getDominoServer();
  return await DominoSetupSession.getSetupSession(dominoAccess, dominoServer);
};
