/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoAccess, DominoApiMeta } from '.';
import { DominoRestConnector } from './RestInterfaces';
import { HttpResponseError, MissingParamError, OperationNotAvailable } from './errors';

/**
 * All information needed to read a method
 */
export type DominoRestOperation = {
  method: string;
  url: string;
  params: Map<string, any>;
  mimeType?: string;
  [key: string]: any;
};

/**
 * All data that needs to be provided to the Domino Rest connector
 */
export type DominoRequestOptions = {
  /**
   * The scope name.
   */
  dataSource?: string;
  /**
   * Additional URL parameters if required.
   */
  params: Map<string, string>;
  /**
   * for POST, PUT, PATCH: the request body
   */
  body?: any;
};

/**
 * Response to the request
 */
export type DominoRequestResponse = {
  /**
   * HTTP status code of response
   */
  status: number;
  /**
   *
   */
  headers: Headers;
  dataStream: ReadableStream<any> | null;
};

/**
 * Handles connection with the Domino REST API server. Is aware of OpenAPI specification
 * of each operation and is capable of building all `fetch` options as long as given
 * parameters are valid. Does not store session information, so it can be used in a multi-user context.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */
export class DominoConnector implements DominoRestConnector {
  schema: Map<string, any> = new Map();

  readonly baseUrl: string;
  readonly meta: DominoApiMeta;

  private constructor(baseUrl: string, meta: DominoApiMeta, schema: Map<string, any>) {
    this.schema = schema;
    this.baseUrl = baseUrl;
    this.meta = meta;
  }

  static getConnector = (baseUrl: string, meta: DominoApiMeta) =>
    new Promise<DominoConnector>((resolve, reject) => {
      DominoConnector._apiLoader(baseUrl, meta.mountPath, meta.fileName)
        .then((apis) => {
          const schema = DominoConnector._operationLoader(apis);
          return resolve(new DominoConnector(baseUrl, meta, schema));
        })
        .catch((error) => reject(error));
    });

  private static _apiLoader = (baseUrl: string, mountPath: string, fileName: string) =>
    new Promise((resolve, reject) => {
      const url = new URL(baseUrl);
      url.pathname = `${mountPath}${fileName}`;

      fetch(url.toString())
        .then(async (response) => {
          const json = await response.json();
          if (!response.ok) {
            throw new HttpResponseError(json);
          }
          return json;
        })
        .then((json) => resolve(json))
        .catch((error) => reject(error));
    });

  private static _operationLoader = (apis: any): Map<string, any> => {
    const schema: Map<string, any> = new Map();
    const paths = apis.paths;

    for (const url in paths) {
      const path = paths[url];
      for (const method in path) {
        if (path[method].operationId) {
          const params = new Map();
          // Parameters defined on the path level for all methods
          DominoConnector._parameterLoader(path, params);
          // Parameters on the operation / method level
          // can overwrite or extend the definition
          DominoConnector._parameterLoader(path[method], params);

          const operation: DominoRestOperation = {
            method: method.toUpperCase(),
            url: url,
            params: params,
          };
          // Load other definitions apart from the operationId and parameters
          DominoConnector._loadOperationDefinitions(operation, path[method]);

          if (path[method].requestBody?.content) {
            operation.mimeType = Object.keys(path[method].requestBody.content)[0];
          }

          schema.set(path[method].operationId, operation);
        }
      }
    }

    return schema;
  };

  private static _loadOperationDefinitions = (operation: DominoRestOperation, pathMethod: any) => {
    for (const key of Object.keys(pathMethod)) {
      // Skip manually added definitions
      if (key === 'operationId' || key === 'parameters') {
        continue;
      }
      operation[key] = pathMethod[key];
    }
  };

  private static _parameterLoader = (source: any, result: Map<string, any>): void => {
    const sourceParams = source.parameters;
    if (sourceParams) {
      for (const param of sourceParams) {
        result.set(param.name, param);
      }
    }
  };

  private static _checkForMandatory = (required: boolean, params: Map<string, string>, pname: string, scope: string) => {
    if (required) {
      let candidate;
      if (pname === 'dataSource') {
        candidate = scope;
        if (candidate === undefined || candidate.trim() === '') {
          candidate = params.get(pname);
        }
      } else {
        candidate = params.get(pname);
      }
      if (candidate === undefined || candidate.trim() === '') {
        throw new MissingParamError(pname);
      }
    }
  };

  getUrl = (operation: DominoRestOperation, scope: string, params: Map<string, string>) => {
    let rawURL = operation.url;
    const workingURL: URL = new URL(rawURL, this.baseUrl);
    const queryParams: URLSearchParams = workingURL.searchParams;
    operation.params.forEach((ops: any, pname: string) => {
      if (ops.in === 'header' || ops.in === 'cookie') {
        return;
      }
      // Check for mandatory parameters missing
      DominoConnector._checkForMandatory(ops.required, params, pname, scope);
      if (pname === 'dataSource' || params.has(pname)) {
        const newValue: string = pname === 'dataSource' ? scope : params.get(pname)!;
        if (ops.in === 'path') {
          const searchFor = `{${pname}}`;
          rawURL = rawURL.replace(searchFor, newValue);
        } else {
          queryParams.set(pname, newValue);
        }
      }
    });
    rawURL = this.meta.mountPath + rawURL;
    workingURL.pathname = rawURL;
    return workingURL.toString();
  };

  request = (dominoAccess: DominoAccess, operationId: string, options: DominoRequestOptions) =>
    new Promise<DominoRequestResponse>((resolve, reject) => {
      const scopeVal = options.dataSource ? options.dataSource : '';
      const operation = this.getOperation(operationId);
      const url = this.getUrl(operation, scopeVal, options.params);

      this.getFetchOptions(dominoAccess, operation, options)
        .then((params) => fetch(url, params))
        .then((response) => {
          const result: DominoRequestResponse = {
            status: response.status,
            headers: response.headers,
            dataStream: response.body,
          };

          return resolve(result);
        })
        .catch((error) => reject(error));
    });

  getOperation = (operationId: string) => {
    if (this.schema.has(operationId)) {
      return this.schema.get(operationId);
    }
    throw new OperationNotAvailable(operationId);
  };

  getOperations = () => this.schema;

  getFetchOptions = (dominoAccess: DominoAccess, operation: DominoRestOperation, request: DominoRequestOptions) =>
    new Promise<any>((resolve, reject) => {
      const params: Map<string, string> = request.params;
      const headers: any = {};
      const result: any = {
        method: operation.method,
      };
      if (request.body) {
        result.body = request.body;
      }
      operation.params.forEach((ops: any, pname: string) => {
        // Check for mandatory parameters missing
        if (ops.required && ops.in === 'header' && !params.has(pname)) {
          return reject(new MissingParamError(pname));
        }
        if (params.has(pname) && ops.in === 'header') {
          headers[pname] = params.get(pname);
        }
      });
      if (operation.mimeType) {
        headers['Content-Type'] = operation.mimeType;
      }

      dominoAccess
        .accessToken()
        .then((token) => {
          headers.Authorization = 'Bearer ' + token;
          result.headers = headers;
          resolve(result);
        })
        .catch((err) => reject(err));
    });
}

export default DominoConnector;
