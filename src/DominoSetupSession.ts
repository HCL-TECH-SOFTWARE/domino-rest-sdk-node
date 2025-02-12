/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import DominoListViewOperations from './DominoListViewOperations.js';
import DominoScopeOperations from './DominoScopeOperations.js';
import { DominoSetupRestSession } from './RestInterfaces.js';
import { DesignOptions, DominoRestAccess, DominoRestConnector, DominoRestScope, DominoRestServer, ListViewBody, ScopeBody } from './index.js';

/**
 * Takes in both Domino access and connector, and forms a session wherein a user
 * has access to SETUP Domino REST API operations.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoSetupSession implements DominoSetupRestSession {
  dominoAccess: DominoRestAccess;
  dominoConnector: DominoRestConnector;

  /**
   * Static factory method to get DominoSetupSession.
   *
   * @param dominoAccess DominoAccess to use
   * @param dominoServer DominoServer to use
   * @returns DominoSetupSession class
   */
  static readonly getSetupSession = (dominoAccess: DominoRestAccess, dominoServer: DominoRestServer) =>
    new Promise<DominoSetupSession>((resolve, reject) => {
      dominoServer
        .getDominoConnector('setup')
        .then((dominoConnector) => resolve(new DominoSetupSession(dominoAccess, dominoConnector)))
        .catch((error) => reject(error));
    });

  constructor(dominoAccess: DominoRestAccess, dominoConnector: DominoRestConnector) {
    this.dominoAccess = dominoAccess;
    this.dominoConnector = dominoConnector;
  }

  createUpdateScope = (scope: DominoRestScope | ScopeBody) => DominoScopeOperations.createUpdateScope(scope, this.dominoAccess, this.dominoConnector);

  getScope = (scopeName: string) => DominoScopeOperations.getScope(scopeName, this.dominoAccess, this.dominoConnector);

  getScopes = () => DominoScopeOperations.getScopes(this.dominoAccess, this.dominoConnector);

  deleteScope = (scopeName: string) => DominoScopeOperations.deleteScope(scopeName, this.dominoAccess, this.dominoConnector);

  createUpdateListView = (dataSource: string, listView: ListViewBody, designName: string, options?: DesignOptions) =>
    DominoListViewOperations.createUpdateListView(dataSource, this.dominoAccess, this.dominoConnector, listView, designName, options);

  getListView = (dataSource: string, designName: string, options?: DesignOptions) =>
    DominoListViewOperations.getListView(dataSource, this.dominoAccess, this.dominoConnector, designName, options);
}

export default DominoSetupSession;
