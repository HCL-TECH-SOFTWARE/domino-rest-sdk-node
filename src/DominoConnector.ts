/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import { DominoAccess, DominoApiMeta } from '.';
import { DominoRestConnector } from './RestInterfaces';

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
  /**
   * A function that subscribes to response and reacts to each JSON item received.
   */
  subscriber?: (() => WritableStream<any>) | null;
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
      return DominoConnector._apiLoader(baseUrl, meta.mountPath, meta.fileName)
        .then((apis) => {
          const schema = DominoConnector._operationLoader(apis);
          return resolve(new DominoConnector(baseUrl, meta, schema));
        })
        .catch((error) => reject(error));
    });

  private static _apiLoader = (baseUrl: string, mountPath: string, fileName: string) =>
    new Promise(async (resolve, reject) => {
      const url = new URL(baseUrl);
      url.pathname = `${mountPath}${fileName}`;

      return fetch(url.toString())
        .then((response) => response.json())
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
          for (const key of Object.keys(path[method])) {
            if (key === 'operationId' || key === 'parameters') {
              continue;
            }
            operation[key] = path[method][key];
          }

          if (path[method].requestBody && path[method].requestBody.content) {
            operation.mimeType = Object.keys(path[method].requestBody.content)[0];
          }
          schema.set(path[method].operationId, operation);
        }
      }
    }

    return schema;
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
        if (candidate === undefined || candidate.trim() == '') {
          candidate = params.get(pname);
        }
      } else {
        candidate = params.get(pname);
      }
      if (candidate === undefined || candidate.trim() == '') {
        throw new Error(`Parameter ${pname} is mandatory!`);
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

  private _splitStream = () => {
    const splitOn = '\n';
    let buffer = '';
    return new TransformStream({
      transform(chunk, controller) {
        buffer += chunk;
        const parts = buffer.split(splitOn);
        parts.slice(0, -1).forEach((part) => controller.enqueue(part));
        buffer = parts[parts.length - 1];
      },
      flush(controller) {
        if (buffer) {
          controller.enqueue(buffer);
        }
      },
    });
  };

  private _parseJSON = () => {
    return new TransformStream({
      transform(chunk, controller) {
        if (chunk.endsWith(',')) {
          controller.enqueue(JSON.parse(chunk.slice(0, -1)));
        } else if (chunk.endsWith('}')) {
          controller.enqueue(JSON.parse(chunk));
        }
      },
    });
  };

  private async _handleChunkedResponse(httpBody: ReadableStream<Uint8Array>, subscriber: () => WritableStream<any>) {
    await httpBody.pipeThrough(new TextDecoderStream()).pipeThrough(this._splitStream()).pipeThrough(this._parseJSON()).pipeTo(subscriber());
  }

  async request<T = any>(dominoAccess: DominoAccess, operationId: string, options: DominoRequestOptions): Promise<T> {
    const scopeVal = options.dataSource ? options.dataSource : '';
    const operation = await this.getOperation(operationId);
    const url = await this.getUrl(operation, scopeVal, options.params);
    const params = await this.getFetchOptions(dominoAccess, operation, options);

    const response = await fetch(url, params);
    const contentType = response.headers.get('content-type');

    if (!response.ok && contentType === null) {
      return Promise.reject(new Error(response.statusText));
    } else if (contentType === null) {
      return Promise.resolve() as any;
    }

    if (response.ok && options.subscriber !== undefined && options.subscriber !== null) {
      if (response.body === null) {
        return Promise.reject(new Error('Response body is null.'));
      }
      await this._handleChunkedResponse(response.body, options.subscriber);
      return Promise.resolve() as any;
    }

    let responseBody: any;
    if (contentType.indexOf('application/json') >= 0) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    if (!response.ok) {
      return Promise.reject(responseBody);
    }
    return Promise.resolve(responseBody);
  }

  getOperation = (operationId: string) => {
    if (this.schema.has(operationId)) {
      return this.schema.get(operationId);
    }
    throw new Error(`Operation ID '${operationId}' is not available`);
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
          return reject(new Error(`Parameter ${pname} is mandatory!`));
        }
        if (params.has(pname) && ops.in === 'header') {
          headers[pname] = params.get(pname);
        }
      });
      if (operation.mimeType) {
        headers['Content-Type'] = operation.mimeType;
      }

      return dominoAccess
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
