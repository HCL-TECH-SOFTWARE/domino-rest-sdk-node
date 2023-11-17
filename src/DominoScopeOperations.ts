/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoAccess, DominoRequestOptions, ScopeBody } from '.';
import DominoConnector from './DominoConnector';
import DominoScope from './DominoScope';

/**
 * API call helper functions for scope operations.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoScopeOperations {
  private static _executeOperation = <T = any>(
    dominoConnector: DominoConnector,
    dominoAccess: DominoAccess,
    operationId: string,
    options: DominoRequestOptions,
  ) => dominoConnector.request<T>(dominoAccess, operationId, options);

  static getScope = (scopeName: string, dominoAccess: DominoAccess, dominoConnector: DominoConnector) =>
    new Promise<DominoScope>((resolve, reject) => {
      if (scopeName.trim().length === 0) {
        return reject(new Error('scopeName must not be empty.'));
      }

      const params: Map<string, any> = new Map();
      params.set('scopeName', scopeName);

      const reqOptions: DominoRequestOptions = { params };

      return this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'getScopeMapping', reqOptions)
        .then((scope) => resolve(new DominoScope(scope)))
        .catch((error) => reject(error));
    });

  static getScopes = (dominoAccess: DominoAccess, dominoConnector: DominoConnector) =>
    new Promise<DominoScope[]>((resolve, reject) => {
      const params: Map<string, any> = new Map();

      const reqOptions: DominoRequestOptions = { params };

      return this._executeOperation<ScopeBody[]>(dominoConnector, dominoAccess, 'fetchScopeMappings', reqOptions)
        .then((scopes) => resolve(scopes.map((scope) => new DominoScope(scope))))
        .catch((error) => reject(error));
    });

  static deleteScope = (scopeName: string, dominoAccess: DominoAccess, dominoConnector: DominoConnector) =>
    new Promise<DominoScope>((resolve, reject) => {
      if (scopeName.trim().length === 0) {
        return reject(new Error('scopeName must not be empty.'));
      }

      const params: Map<string, any> = new Map();
      params.set('scopeName', scopeName);

      const reqOptions: DominoRequestOptions = { params };

      return this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'deleteScopeMapping', reqOptions)
        .then((scope) => resolve(new DominoScope(scope)))
        .catch((error) => reject(error));
    });

  static createUpdateScope = (scope: DominoScope | ScopeBody, dominoAccess: DominoAccess, dominoConnector: DominoConnector) =>
    new Promise<DominoScope>((resolve, reject) => {
      let dominoScope: DominoScope;
      if (!(scope instanceof DominoScope)) {
        dominoScope = new DominoScope(scope);
      } else {
        dominoScope = scope;
      }

      const params: Map<string, any> = new Map();
      const reqOptions: DominoRequestOptions = {
        params,
        body: JSON.stringify(dominoScope.toScopeJson()),
      };

      return this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'createUpdateScopeMapping', reqOptions)
        .then((scope) => resolve(new DominoScope(scope)))
        .catch((error) => reject(error));
    });
}

export default DominoScopeOperations;
