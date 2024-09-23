/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

/* Creates and exports different Domino user sessions that uses different connectors
 * for other JavaScript files to use. It uses both Domino access and Domino server
 * exported from _DominoAccess and _DominoServer. */

import { DominoBasisSession, DominoSetupSession } from '@hcl-software/domino-rest-sdk-node';
import { dominoAccess } from './_DominoAccess.js';
import { getDominoServer } from './_DominoServer.js';

/**
 * Get a Domino basis session.
 * @returns {Promise<DominoBasisSession>}
 */
export const getDominoBasisSession = async () => {
  const dominoServer = await getDominoServer();
  return await DominoBasisSession.getBasisSession(dominoAccess, dominoServer);
};

/**
 * Get a Domino setup session.
 * @returns {Promise<DominoSetupSession>}
 */
export const getDominoSetupSession = async () => {
  const dominoServer = await getDominoServer();
  return await DominoSetupSession.getSetupSession(dominoAccess, dominoServer);
};
