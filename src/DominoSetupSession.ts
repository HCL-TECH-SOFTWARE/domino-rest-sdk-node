/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DesignOptions, DominoAccess, DominoServer, ListViewBody, ScopeBody } from './index.ts';
import DominoConnector from './DominoConnector.ts';
import DominoListViewOperations from './DominoListViewOperations.ts';
import DominoScope from './DominoScope.ts';
import DominoScopeOperations from './DominoScopeOperations.ts';
import { DominoSetupRestSession } from './RestInterfaces.ts';

/**
 * Takes in both Domino access and connector, and forms a session wherein a user
 * has access to SETUP Domino REST API operations.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoSetupSession implements DominoSetupRestSession {
  dominoAccess: DominoAccess;
  dominoConnector: DominoConnector;

  /**
   * Static factory method to get DominoSetupSession.
   *
   * @param dominoAccess DominoAccess to use
   * @param dominoServer DominoServer to use
   * @returns DominoSetupSession class
   */
  static getSetupSession = (dominoAccess: DominoAccess, dominoServer: DominoServer) =>
    new Promise<DominoSetupSession>((resolve, reject) => {
      dominoServer
        .getDominoConnector('setup')
        .then((dominoConnector) => resolve(new DominoSetupSession(dominoAccess, dominoConnector)))
        .catch((error) => reject(error));
    });

  constructor(dominoAccess: DominoAccess, dominoConnector: DominoConnector) {
    this.dominoAccess = dominoAccess;
    this.dominoConnector = dominoConnector;
  }

  createUpdateScope = (scope: DominoScope | ScopeBody) => DominoScopeOperations.createUpdateScope(scope, this.dominoAccess, this.dominoConnector);

  getScope = (scopeName: string) => DominoScopeOperations.getScope(scopeName, this.dominoAccess, this.dominoConnector);

  getScopes = () => DominoScopeOperations.getScopes(this.dominoAccess, this.dominoConnector);

  deleteScope = (scopeName: string) => DominoScopeOperations.deleteScope(scopeName, this.dominoAccess, this.dominoConnector);

  createUpdateListView = (dataSource: string, listView: ListViewBody, designName: string, options?: DesignOptions) =>
    DominoListViewOperations.createUpdateListView(dataSource, this.dominoAccess, this.dominoConnector, listView, designName, options);

  getListView = (dataSource: string, designName: string, options?: DesignOptions) =>
    DominoListViewOperations.getListView(dataSource, this.dominoAccess, this.dominoConnector, designName, options);
}

export default DominoSetupSession;
