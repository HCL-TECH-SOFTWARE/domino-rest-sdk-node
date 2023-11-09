/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import DominoConnector from './DominoConnector';
import { DominoRestServer } from './RestInterfaces';

/**
 * Data structure returned by the /api endpoint describing the available OpenAPI endpoints.
 */
export type DominoApiMeta = {
  /**
   * This API's OpenAPI specification JSON.
   */
  fileName: string;
  /**
   * A URL path where this API is accessible.
   */
  mountPath: string;
  /**
   * The API name.
   */
  name: string;
  /**
   * The title of this API.
   */
  title: string;
  /**
   * API version.
   */
  version: string;
};

/**
 * Contains available APIs of Domino REST API server and maps each of it to its
 * own DominoConnector.
 *
 * @author <stephan.wissel@hcl.software>
 * @author <emmanuelryan.gamla@hcl.software>
 * @author <alecvincent.bardiano@hcl.software>
 */

export class DominoServer implements DominoRestServer {
  baseUrl: string;
  /**
   * Maps APIs loaded from Domino REST API server's /api endpoint.
   */
  apiMap: Map<string, DominoApiMeta> = new Map();
  /**
   * Maps APIs to its own DominoConnector.
   */
  connectorMap: Map<string, DominoConnector> = new Map();

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Loads all available APIs on Domino REST API server using /api endpoint.
   *
   * @returns a promise that resolves to a void.
   *
   * @throws an error if something went wrong when fetching.
   */
  private _apiLoader = (): Promise<void> =>
    new Promise((resolve, reject) => {
      fetch(this.baseUrl + '/api')
        .then((response) => response.json())
        .then((json) => {
          for (let key in json) {
            this.apiMap.set(key, json[key]);
          }
        })
        .then(() => resolve())
        .catch((err: Error) => {
          err.message = '_apiLoader failed';
          reject(err);
        });
    });

  availableApis = async (): Promise<Array<string>> => {
    if (this.apiMap.size > 0) {
      return Promise.resolve(Array.from(this.apiMap.keys()));
    }

    try {
      await this._apiLoader();
    } catch (err) {
      throw err;
    }

    return Array.from(this.apiMap.keys());
  };

  availableOperations = async (apiName: string): Promise<Map<string, any>> => {
    try {
      const dc: DominoConnector = await this.getDominoConnector(apiName);
      const operations = await dc.getOperations();
      return Promise.resolve(operations);
    } catch (e) {
      return Promise.reject(e);
    }
  };

  getDominoConnector = async (apiName: string): Promise<DominoConnector> => {
    if (this.apiMap.size == 0) {
      await this._apiLoader();
    }

    if (this.connectorMap.has(apiName)) {
      return Promise.resolve(this.connectorMap.get(apiName) as DominoConnector);
    }

    if (this.apiMap.has(apiName)) {
      let dc = new DominoConnector(this.baseUrl, this.apiMap.get(apiName) as DominoApiMeta);
      this.connectorMap.set(apiName, dc);
      return Promise.resolve(dc);
    }

    return Promise.reject(new Error(`API ${apiName} not available on this server`));
  };
}
