/* ========================================================================== *
 * Copyright (C) 2023, 2025 HCL America Inc.                                  *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import DominoRestOperations from './DominoRestOperations.js';
import DominoScope from './DominoScope.js';
import { EmptyParamError } from './errors/index.js';
import { streamToJson } from './helpers/StreamHelpers.js';
import { isEmpty } from './helpers/Utilities.js';
import { DominoRequestOptions, DominoRestAccess, DominoRestConnector, DominoRestScope, ScopeBody } from './index.js';

/**
 * API call helper functions for scope operations.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoScopeOperations extends DominoRestOperations {
  static getScope = (scopeName: string, dominoAccess: DominoRestAccess, dominoConnector: DominoRestConnector) =>
    new Promise<DominoScope>((resolve, reject) => {
      if (isEmpty(scopeName)) {
        return reject(new EmptyParamError('scopeName'));
      }

      const params: Map<string, any> = new Map();
      params.set('scopeName', scopeName);

      const reqOptions: DominoRequestOptions = { params };

      this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'getScopeMapping', reqOptions, streamToJson)
        .then((scope) => resolve(new DominoScope(scope)))
        .catch((error) => reject(error));
    });

  static getScopes = (dominoAccess: DominoRestAccess, dominoConnector: DominoRestConnector) =>
    new Promise<DominoScope[]>((resolve, reject) => {
      const params: Map<string, any> = new Map();

      const reqOptions: DominoRequestOptions = { params };

      this._executeOperation<ScopeBody[]>(dominoConnector, dominoAccess, 'fetchScopeMappings', reqOptions, streamToJson)
        .then((scopes) => resolve(scopes.map((scope) => new DominoScope(scope))))
        .catch((error) => reject(error));
    });

  static deleteScope = (scopeName: string, dominoAccess: DominoRestAccess, dominoConnector: DominoRestConnector) =>
    new Promise<DominoScope>((resolve, reject) => {
      if (isEmpty(scopeName)) {
        return reject(new EmptyParamError('scopeName'));
      }

      const params: Map<string, any> = new Map();
      params.set('scopeName', scopeName);

      const reqOptions: DominoRequestOptions = { params };

      this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'deleteScopeMapping', reqOptions, streamToJson)
        .then((scope) => resolve(new DominoScope(scope)))
        .catch((error) => reject(error));
    });

  static createUpdateScope = (scope: DominoRestScope | ScopeBody, dominoAccess: DominoRestAccess, dominoConnector: DominoRestConnector) =>
    new Promise<DominoScope>((resolve, reject) => {
      if (isEmpty(scope)) {
        return reject(new EmptyParamError('scope'));
      }

      let dominoScope: DominoRestScope;
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

      this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'createUpdateScopeMapping', reqOptions, streamToJson)
        .then((scope) => resolve(new DominoScope(scope)))
        .catch((error) => reject(error));
    });

  static basisGetScope = (dataSource: string, dominoAccess: DominoRestAccess, dominoConnector: DominoRestConnector) =>
    new Promise<DominoScope>((resolve, reject) => {
      if (isEmpty(dataSource)) {
        return reject(new EmptyParamError('dataSource'));
      }

      const params: Map<string, any> = new Map();
      const reqOptions: DominoRequestOptions = { dataSource, params };

      this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'getScope', reqOptions, streamToJson)
        .then((scope) => resolve(new DominoScope(scope)))
        .catch((error) => reject(error));
    });
}

export default DominoScopeOperations;
