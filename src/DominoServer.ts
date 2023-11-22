/* ========================================================================== *
 * Copyright (C) 2023 HCL America Inc.                                        *
 * Apache-2.0 license   https://www.apache.org/licenses/LICENSE-2.0           *
 * ========================================================================== */

import DominoConnector from './DominoConnector';
import { DominoRestServer } from './RestInterfaces';
import { ApiNotAvailable } from './errors';

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

  private constructor(baseUrl: string, apiMap: Map<string, DominoApiMeta>) {
    this.baseUrl = baseUrl;
    this.apiMap = apiMap;
  }

  /**
   * Factory for getting DominoServer class.
   *
   * @param baseUrl base URL of Domino REST API server
   * @returns a DominoServer class
   *
   * @throws an error if something went wrong on loading APIs
   */
  static getServer = (baseUrl: string) =>
    new Promise<DominoServer>((resolve, reject) => {
      DominoServer._apiLoader(baseUrl)
        .then((apis) => {
          const apiMap: Map<string, DominoApiMeta> = new Map();
          for (const key in apis) {
            apiMap.set(key, apis[key]);
          }
          return resolve(new DominoServer(baseUrl, apiMap));
        })
        .catch((error) => reject(error));
    });

  /**
   * Loads all available APIs on Domino REST API server using /api endpoint.
   *
   * @returns a promise that resolves to a void.
   *
   * @throws an error if something went wrong when fetching.
   */
  private static _apiLoader = (baseUrl: string) =>
    new Promise<any>((resolve, reject) => {
      const url = new URL(baseUrl);
      url.pathname = '/api';

      fetch(url.toString())
        .then((response) => response.json())
        .then((apis) => resolve(apis))
        .catch((error) => {
          error.message = '_apiLoader failed';
          reject(error);
        });
    });

  availableApis = () => Array.from(this.apiMap.keys());

  getDominoConnector = (apiName: string) =>
    new Promise<DominoConnector>((resolve, reject) => {
      if (this.connectorMap.has(apiName)) {
        return resolve(this.connectorMap.get(apiName) as DominoConnector);
      }

      if (this.apiMap.has(apiName)) {
        DominoConnector.getConnector(this.baseUrl, this.apiMap.get(apiName) as DominoApiMeta)
          .then((dominoConnector) => {
            this.connectorMap.set(apiName, dominoConnector);
            return resolve(dominoConnector);
          })
          .catch((error) => reject(error));
        return;
      }

      reject(new ApiNotAvailable(apiName));
    });

  availableOperations = (apiName: string) =>
    new Promise<Map<string, any>>((resolve, reject) => {
      this.getDominoConnector(apiName)
        .then((dominoConnector) => resolve(dominoConnector.getOperations()))
        .catch((error) => reject(error));
    });
}
