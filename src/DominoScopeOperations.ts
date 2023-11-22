/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoAccess, DominoRequestOptions, ScopeBody } from '.';
import DominoConnector from './DominoConnector';
import DominoScope from './DominoScope';
import { EmptyParamError, HttpResponseError, NoResponseBody } from './errors';
import { streamToJson } from './helpers/StreamHelpers';
import { isEmpty } from './helpers/Utilities';

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
    streamDecoder: (dataStream: ReadableStream<any>) => Promise<T>,
  ) =>
    new Promise<T>((resolve, reject) => {
      dominoConnector
        .request(dominoAccess, operationId, options)
        .then(async (result) => {
          if (result.dataStream === null) {
            throw new NoResponseBody(operationId);
          }
          const decodedStream = await streamDecoder(result.dataStream);
          if (result.status >= 400) {
            throw new HttpResponseError(decodedStream as any);
          }

          return resolve(decodedStream);
        })
        .catch((error) => reject(error));
    });

  static getScope = (scopeName: string, dominoAccess: DominoAccess, dominoConnector: DominoConnector) =>
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

  static getScopes = (dominoAccess: DominoAccess, dominoConnector: DominoConnector) =>
    new Promise<DominoScope[]>((resolve, reject) => {
      const params: Map<string, any> = new Map();

      const reqOptions: DominoRequestOptions = { params };

      this._executeOperation<ScopeBody[]>(dominoConnector, dominoAccess, 'fetchScopeMappings', reqOptions, streamToJson)
        .then((scopes) => resolve(scopes.map((scope) => new DominoScope(scope))))
        .catch((error) => reject(error));
    });

  static deleteScope = (scopeName: string, dominoAccess: DominoAccess, dominoConnector: DominoConnector) =>
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

  static createUpdateScope = (scope: DominoScope | ScopeBody, dominoAccess: DominoAccess, dominoConnector: DominoConnector) =>
    new Promise<DominoScope>((resolve, reject) => {
      if (isEmpty(scope)) {
        return reject(new EmptyParamError('scope'));
      }

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

      this._executeOperation<ScopeBody>(dominoConnector, dominoAccess, 'createUpdateScopeMapping', reqOptions, streamToJson)
        .then((scope) => resolve(new DominoScope(scope)))
        .catch((error) => reject(error));
    });
}

export default DominoScopeOperations;
