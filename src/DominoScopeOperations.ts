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
  private static _executeOperation = async <T = any>(
    dominoConnector: DominoConnector,
    dominoAccess: DominoAccess,
    operationId: string,
    options: DominoRequestOptions,
  ): Promise<T> => {
    const response = await dominoConnector.request<T>(dominoAccess, operationId, options);
    return Promise.resolve(response);
  };

  static getScope = async (scopeName: string, dominoAccess: DominoAccess, dominoConnector: DominoConnector): Promise<DominoScope> => {
    if (scopeName.trim().length === 0) {
      return Promise.reject(new Error('scopeName must not be empty.'));
    }

    const params: Map<string, any> = new Map();
    params.set('scopeName', scopeName);

    const reqOptions: DominoRequestOptions = {
      params,
    };
    const docResponse = await this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'getScopeMapping', reqOptions);
    return Promise.resolve(new DominoScope(docResponse));
  };

  static getScopes = async (dominoAccess: DominoAccess, dominoConnector: DominoConnector): Promise<DominoScope[]> => {
    const params: Map<string, any> = new Map();

    const reqOptions: DominoRequestOptions = {
      params,
    };
    const response = await this._executeOperation<ScopeBody[]>(dominoConnector, dominoAccess, 'fetchScopeMappings', reqOptions);
    return Promise.resolve(response.map((doc) => new DominoScope(doc)));
  };

  static deleteScope = async (scopeName: string, dominoAccess: DominoAccess, dominoConnector: DominoConnector): Promise<DominoScope> => {
    if (scopeName.trim().length === 0) {
      return Promise.reject(new Error('scopeName must not be empty.'));
    }

    const params: Map<string, any> = new Map();
    params.set('scopeName', scopeName);

    const reqOptions: DominoRequestOptions = {
      params,
    };
    const docResponse = await this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'deleteScopeMapping', reqOptions);
    return Promise.resolve(new DominoScope(docResponse));
  };

  static createUpdateScope = async (
    scope: DominoScope | ScopeBody,
    dominoAccess: DominoAccess,
    dominoConnector: DominoConnector,
  ): Promise<DominoScope> => {
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

    const docResponse = await this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'createUpdateScopeMapping', reqOptions);
    return Promise.resolve(new DominoScope(docResponse));
  };
}

export default DominoScopeOperations;
